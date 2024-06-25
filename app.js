const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const envelopes = require('./utils/envelopes');
const { convertToNumber, convertToString } = require('./utils/helpers');
const morgan = require('morgan');
const { env } = require('process');

//parse json data
app.use(bodyParser.json());

//url encoded data
app.use(bodyParser.urlencoded({ extended: true}));

//logging middleware
app.use/morgan('tiny');

//static files from public
app.use(express.static(path.join(__dirname, 'public')));


app.get(['/', 'envelopes'], (req, res) => {
  try {
    const envelopesData = envelopes.getAll();
    res.json({ 'envelopes:': envelopesData});
  } catch (error) {
    res.status(500).send('You have an error.');
  }
});

app.post('/envelopes', (req, res, next) => {
  try {
    const name = convertToString(req.body['budget-name']);
    const initialAmount = convertToNumber(req.body['initial-amount']);
    const balance = convertToNumber(req.body['current-balance']);

    if (name && initialAmount && balance) {
      envelopes.addEnvelope(name, initialAmount, balance);
      res.redirect('/');
    } else {
      res.status(400).send('Data you have provided is wrong.');
    }
  } catch (error) {
    res.status(500).send('You have an error.');
  }
});

app.get('/envelopes/:id', (req, res, next) => {
  try {
    const idEnvelope = convertToNumber(req.params.id);
    if(!idEnvelope) {
      return res.status(400).send('Invalid.');
    }

    const envelope = envelopes.getEnvelopeById(idEnvelope);
    if (!envelope) {
      return res.status(404).send('Envelope not found.');
    }

    res.json({ 'envelope': envelope });
  } catch (error) {
    res.status(500).send('You have an error.');
  }
});


app.delete('/envelopes/:id', (req, res, next) => {
  try {
    const idEnvelope = convertToNumber(req.params.id);
    if(!idEnvelope) {
      return res.status(400).send('Invalid.');
    }

    const deleted = envelopes.deleteEnvelope(idEnvelope);
    if (!deleted) {
      return res.status(404).send('Envelope not found.');
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).send('You have an error.');
  }
  });

  app.put('/envelopes/:id', (req, res, next) => {
    try {
      const idEnvelope = convertToNumber(req.params.id);
      if(!idEnvelope) {
        return res.status(400).send('Invalid.');
      }

      const updatedData = req.body;
      console.log(updatedData);

      if(!updatedData || Object.keys(updatedData).length === 0) {
        return res.status(400).send('The updated data is empty.')
      }

      const envelopeToUpdate = envelopes.getEnvelopeById(idEnvelope);

      if (!envelopeToUpdate) {
        return res.status(404).send('Invalid.')
      }

      envelopes.updateEnvelope(idEnvelope, updatedData);
      res.status(204).send();
    } catch (error) {
      res.status(500).send('You have an error.');
    }
  });

  app.post('/envelopes/transfer', (req, res, next) => {
    try {
    const source = convertToNumber(req.body['source-envelope']);
    const destination = convertToNumber(req.body['destination-envelope']);
    const transferAmount = convertToNumber(req.body['transfer-amount']);

    if (source !== destination) {
      if (isNaN(source) || isNaN(destination) || isNaN(transferAmount)) {
        throw new Error('Data is incorrect.');
      }

      const sourceEnvelope = envelopes.getEnvelopeById(source);
      const destinationEnvelope = envelopes.getEnvelopeById(destination);

      if (!sourceEnvelope || !destinationEnvelope) {
        throw new Error('Source or destination not found.');
      }

      if (!envelopes.checkBalance(source, transferAmount)) {
        throw new Error('Insufficient funds.');
      }

      envelopes.updateBalance(source, destination, transferAmount);
      res.redirect('/');
    } else {
      throw new Error('Source and destination cannot be the same.');
    } 
  } catch (error) {
      console.log(error.message);
      res.status(400).send(error.message);
    }
  });



const PORT = process.env.PORT || 8000;


app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });