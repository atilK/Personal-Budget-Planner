export default class EnvelopeManager {
    constructor () {
        this.tableBody = document.getElementById('table-body');
        this.selectElement = document.getElementById('select-envelope');
        this.initialAmountInput = document.getElementById('updated-initial-amount');
        this.currentBalanceinput = document.getElementById('updated-current-balance');
        this.updateForm = document.getElementById('update-form');

        this.updateForm.addEventListener('submit', this.handleUpdateSubmit.bind(this));
        this.selectElement.addEventListener('change', this.handleSelectChange.bind(this));

        this.fetchEnvelopes();
    }

    fetchEnvelopes() {
        fetch('/envelopes')
        .then(response => response.json())
        .then(data => {
            data.envelopes.forEach(envelope => {
                this.populateSelectElement(envelope);
                this.createTableRow(envelope);
                this.populateSelectOptions(envelope);
            });
        })
        .catch(error => {
            console.error('Error retreiving data:', error);
        }
    )}


populateSelectElement(envelope) {
    const option = document.createElement('option');
    option.value = envelope.id;
    option.textContent = envelope.name;
    this.selectElement.appendChild(option);
}
   

createTableRow(envelope) {
    const row = document.createElement('tr');
        const nameCell = document.createElement('td');
        const initialAmountCell = document.createElement('td');
        const currentBalanceCell = document.createElement('td');
        const actionsCell = document.createElement('td');
        const deleteButton = document.createElement('button');

        nameCell.textContent = envelope.name;
        initialAmountCell.textContent = this.formatAmount(envelope.montant_initial);
        currentBalanceCell.textContent = this.formatAmount(envelope.solde_actuel);

        this.setupDeleteButton(deleteButton, envelope.id);

        actionsCell.appendChild(deleteButton);
        row.appendChild(nameCell);
        row.appendChild(initialAmountCell);
        row.appendChild(currentBalanceCell);
        row.appendChild(actionsCell);
        this.tableBody.appendChild(row);
}

setupDeleteButton(deleteButton, envelopeId) {
    deleteButton.setAttribute('class', 'del-btn');
    deleteButton.setAttribute('data-id', envelopeId);
    deleteButton.textContent = 'Supprimer';

    deleteButton.addEventListener('click', () => {
        this.deleteEnvelope(envelopeId);
    });
}

deleteEnvelope(envelopeId) {
    fetch(`/envelopes/${envelopeId}`, {
        method: 'DELETE',
    })
        .then(response => {
            if (response.ok) {
                location.reload()
            } else {
                console.error('Error removing ID: ' + envelopeId);
            }
        })
        .catch(error => {
            console.error('Error deleting the envelope:', error);
        });
}

formatAmount(amount) {
    return amount + '€';
}

handleSelectChange() {
    const selectedId = this.selectElement.value;

    fetch(`/envelopes/${selectedId}`)
        .then(response => response.json())
        .then(data => {
            const selectedEnvelope = data.envelope;
            this.initialAmountInput.value = selectedEnvelope.montant_initial;
            this.currentBalanceInput.value = selectedEnvelope.solde_actuel;
        })
        .catch(error => {
            console.error('Error retreiving the envelope: ', error);
        });
};

handleUpdateSubmit(e) {
    e.preventDefault();
    const selectedId = this.selectElement.value;
    const updatedInitialAmount = this.initialAmountInput.value;
    const updatedCurrentBalance = this.currentBalanceInput.value;

    const updatedData = {
        montant_initial: parseFloat(updatedInitialAmount),
        solde_actuel: parseFloat(updatedCurrentBalance)
    };

    fetch(`/envelopes/${selectedId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
    })
        .then(response => {
            if (response.ok) {
                console.log('The envelope witht the ID' + selectedId + ' has been updated');
                location.reload();
            } else {
                console.error('Error updating the envelope ID:  ' + selectedId);
            }
        })
        .catch(error => {
            console.error('Error updating envelope:', error);
        });
}


populateSelectOptions(envelope) {
    const option = document.createElement('option');
    option.value = envelope.id;
    option.textContent = envelope.nom;

    const sourceSelect = document.getElementById('source-envelope');
    const destinationSelect = document.getElementById('destination-envelope');

    sourceSelect.appendChild(option.cloneNode(true));
    destinationSelect.appendChild(option);
}
}