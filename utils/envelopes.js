const fs = require('fs');
const path = require('path');

const envelopesFilePath = path.join(__dirname, 'envelopes.json');

const getAll = () => {
    const envelopesData = fs.readFileSync(envelopesFilePath, 'utf-8');
    return JSON.parse(envelopesData);
}

const addEnvelope = (name, amount, balance) => {
    const envelopes = getAll();

  
    let lastId = 0;
    for (const envelope of envelopes) {
        if (envelope.id > lastId) {
            lastId = envelope.id;
        }
    }

    
    const newEnvelope = {
        id: lastId + 1,
        nom: name,
        montant_initial: parseFloat(amount),
        solde_actuel: parseFloat(balance)
    };

   
    envelopes.push(newEnvelope);

   
    fs.writeFileSync(envelopesFilePath, JSON.stringify(envelopes, null, 4), 'utf-8');
}

const deleteEnvelope = (id) => {
    const envelopes = getAll();
    const envelopeIndex = envelopes.findIndex(envelope => envelope.id === id);

    if (envelopeIndex !== -1) {
        envelopes.splice(envelopeIndex, 1);
        fs.writeFileSync(envelopesFilePath, JSON.stringify(envelopes, null, 4), 'utf-8');
        console.log(`Enveloppe avec ID ${id} supprimée avec succès.`);
        return true;
    } else {
        console.error(`Enveloppe avec ID ${id} non trouvée.`);
        return false
    }
}

const getEnvelopeById = (id) => {
    const envelopes = getAll();
    return envelopes.find(envelope => envelope.id === id);
}

const updateEnvelope = (id, updatedData) => {
    const envelopes = getAll();
    const envelopeToUpdate = envelopes.find(envelope => envelope.id === id);

    if (!envelopeToUpdate) {
        console.error(`Envelope ID ${id} not found`);
        return false; 
    }

    console.log(updatedData.montant_initial, updatedData.solde_actuel)
    console.log("Update " + envelopeToUpdate)

    envelopeToUpdate.montant_initial = parseFloat(updatedData.montant_initial);
    envelopeToUpdate.solde_actuel = parseFloat(updatedData.solde_actuel);

    
    fs.writeFileSync(envelopesFilePath, JSON.stringify(envelopes, null, 4), 'utf-8');

    console.log(`Envelope ID ${id} updated successfully.`);
    return true; 
}

const checkBalance = (source, transfer) => {
    const envelope = getEnvelopeById(source);
    let totalAfterTransfer = envelope.montant_initial - transfer;
    if (totalAfterTransfer > 0) {
        return true
    }
    else {
        return false
    }
}

const updateBalance = (source, destination, transferAmount) => {
    const envelopes = getAll();
    const envelopeSourceToUpdate = envelopes.find(envelope => envelope.id === source);
    const envelopeDestinationToUpdate = envelopes.find(envelope => envelope.id === destination);

    if (!envelopeSourceToUpdate || !envelopeDestinationToUpdate) {
        console.error(`Envelope ID ${source} or ${destination} not found.`);
        return false; 
    }

    if (envelopeSourceToUpdate.solde_actuel < transferAmount) {
        console.error(`Insufficent funds in ID ${source}.`);
        return false; 
    }

    envelopeSourceToUpdate.solde_actuel -= transferAmount;
    envelopeDestinationToUpdate.solde_actuel += transferAmount;

    fs.writeFileSync(envelopesFilePath, JSON.stringify(envelopes, null, 4), 'utf-8');
    return true;
}

module.exports = {
    getAll,
    addEnvelope,
    deleteEnvelope,
    getEnvelopeById,
    updateEnvelope,
    checkBalance,
    updateBalance
}