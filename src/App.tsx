import React, {useEffect} from 'react';
import './App.css';
import * as passworder from '@metamask/browser-passworder';
import KeyringController from 'eth-keyring-controller';
import SimpleKeyring from 'eth-simple-keyring';

window.Buffer = window.Buffer || require("buffer").Buffer; 

function App() {
	const secrets = { coolStuff: 'all', ssn: 'livin large' };
	const password = 'hunter55';
	const seed = "meat admit ivory unfold pistol alley work vault tilt witness lion talent";
	const address = "0x6756fB068c3Cce14DA7e32Ed666F00BEa8486958";

	const removeAccount = () => {

	}

	const keyringController = new KeyringController({
		keyringTypes: [SimpleKeyring], // optional array of types to support.
		// initState: initState.KeyringController, // Last emitted persisted state.
		encryptor: undefined,
	});

	// The KeyringController is also an event emitter:
	keyringController.on('newAccount', (address: string) => {
		console.log(`New account created: ${address}`);
	});
	
	keyringController.on('removedAccount', removeAccount);


	const testEncryptAndDecrypt = () => {
		passworder
		.encrypt(password, secrets)
		.then(function (blob: any) {
			return passworder.decrypt(password, blob);
		})
		.then(function (result: any) {
			console.log(result);
		});
	}

	const createNewVaultAndRestore = async () => {
		const result = await keyringController.createNewVaultAndRestore(password, seed);
		console.log('createNewVaultAndRestore result', result);
	}

	const submitPassword = async (pwd: string) => {
		const result = await keyringController.submitPassword(pwd);
		console.log('submitPassword result', result);
	}

	const createKeyring = async (e: any) => {
		testEncryptAndDecrypt();
		await createNewVaultAndRestore();
	}
	
	const unlock = async (e: any) => {
		// await submitPassword(password + "000"); // wrong password
		await submitPassword(password);
	}

	const verifyPassword = async (e: any) => {
		const result = await keyringController.verifyPassword(password);
		console.log("verifyPassword true");
	}

	const addNewAccount = async (e: any) => {
		const keyring = await keyringController.getKeyringForAccount(address);
		const result = await keyringController.addNewAccount(keyring);
		console.log("addNewAccount result", result.keyrings[0].accounts);
	}

	const getKeyringForAccount = async (e: any) => {
		const result = await keyringController.getKeyringForAccount(address);
		console.log("getKeyringForAccount result", result);
	}

	const getEncryptionPublicKey = async (e: any) => {
		const publicKey = await keyringController.getEncryptionPublicKey(address);
		console.log("getEncryptionPublicKey result", publicKey);
	}

	const setLocked = async (e: any) => {
		await keyringController.setLocked();
		console.log("wallet locked");
	}

	const getPrivateKey = async (e: any) => {
		const keyring = await keyringController.getKeyringForAccount(address);
		const priKey = keyring.wallets[0].privateKey;
		console.log("Private key", priKey);
	}

	const getAccounts = async (e: any) => {
		const accounts = await keyringController.getAccounts();
		console.log("getAccounts result", accounts);
	}
	
  return (
    <div className="App">
      <header className="App-header">
				<div className="button" onClick={(e) => createKeyring(e)}>Initialize wallet</div>
				<div className="button" onClick={(e) => setLocked(e)}>Lock wallet</div>
				<div className="button" onClick={(e) => unlock(e)}>Unlock wallet</div>
				<div className="button" onClick={(e) => verifyPassword(e)}>Verify password</div>
				<div className="button" onClick={(e) => getAccounts(e)}>Get accounts</div>
				<div className="button" onClick={(e) => addNewAccount(e)}>Add a new account</div>
				<div className="button" onClick={(e) => getKeyringForAccount(e)}>Get keyring by address</div>
				<div className="button" onClick={(e) => getEncryptionPublicKey(e)}>Get public key by address</div>
				<div className="button" onClick={(e) => getPrivateKey(e)}>Get private key for 1st address</div>
				
								
      </header>
    </div>
  );
}

export default App;
