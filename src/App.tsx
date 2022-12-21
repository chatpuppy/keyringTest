import { useEffect, useRef, useState } from 'react';
import './App.css';
import * as passworder from '@metamask/browser-passworder';
import KeyringController from 'eth-keyring-controller';
import SimpleKeyring from 'eth-simple-keyring';
import HdKeyring from 'eth-hd-keyring';
import * as sigUtil from "@metamask/eth-sig-util";
import * as ethUtil from "ethereumjs-util";

window.Buffer = window.Buffer || require("buffer").Buffer; 

function App() {
	const [currentAccount, setCurrentAccount] = useState('');
	const [currentChainId, setCurrentChainId] = useState(1);
	const [encryptionPublicKey, setEncryptionPublicKey] = useState('');
	const [inputText, setInputText] = useState('');
	const [encryptedMessage, setEncryptedMessage] = useState('');
	const [decryptedMessage, setDecryptedMessage] = useState('');
	const [errorMessage, setErrorMessage] = useState('');

	const secrets = { coolStuff: 'all', ssn: 'livin large' };
	const password = 'hunter55';
	const seed = "meat admit ivory unfold pistol alley work vault tilt witness lion talent";
	const encryptedSecret = `{"data":"T+Q79TgFUVSgdKW8xGCj1NQgF+nmgC09h0/gcK4rQ8Q6ipQTTmWv2qkbZlatJa/lWXJjmjJMWIJZ8b8zpF/ychWH/n9G07Xm+Dw0ZOrZysvHGhSzdrMo7GMfotBeB9MY0IHz1fVtIgZGoiqbu1chb/TAGE7Cuo/hMzZsSciZHc6Fpa4KTcm+AvcGstI9OqIll+vA3lc80eayLg8WXAc4kNatygd8Fn4q07DHD6LLMZZ8lbGM+VdSBWu/rPQecupRU0xDzyWoRZK7POotUeSAvsKCLM2FloiR+hozY9vIB3IYG2lz0sbBtBkbMgGkKEC9iZkoY044WePO4Y3aazIaz1ZvnLBaGpI9TtiiXS6IlUi0NaKgO31T7NTc8mNo4X/zl4L/2S93L6a9ojHsfHFyGZMaZX+82kVeJkEdE7YeJUq5IFuW25VN+8T2OjRS/FHLMp0Du2hTn60FI/f2flZwxVHN9Jduqf9ihAag9hibvOeybToMv30LhYnvdwhP","iv":"DsLw7ergwFepPG3cr7WbqA==","salt":"h5DQGdRoG0SMiXec05m6hrXFfuG6pne2xjJz+H4u3zc="}`;

	const initialized = useRef(false);
	
	useEffect(():any => {
		console.log('initialized', initialized.current)
		const init = async () => {
			if(initialized.current) return;
			if(currentAccount === '') {
				if(!window.ethereum) {
					// console.log("Please install metamask wallet!");
					console.log("install_metamask");
					// setLoading(false);
					return;
				}
				const chainId = await window.ethereum.request({ method: 'eth_chainId' });
				setCurrentChainId(parseInt(chainId, 16));
				let accounts:Array<string> = await window.ethereum.request({ method: 'eth_accounts' });
				if (accounts.length === 0) {
					// No account connected
					await window.ethereum.request({ method: 'eth_requestAccounts'});
					accounts = await window.ethereum.request({ method: 'eth_accounts' });
				} 
				setCurrentAccount(accounts[0]);
			}	
		}
		init();
		return () => initialized.current = true;
	},[]);

	const removeAccount = () => {

	}

	const newVaultHandler = () => {

	}

	const unlockHandler = () => {

	}

	let keyringController = new KeyringController({
		keyringTypes: [SimpleKeyring, HdKeyring], // optional array of types to support.
		// initState: initState.KeyringController, // Last emitted persisted state.
		encryptor: undefined,
	});

	// The KeyringController is also an event emitter:
	keyringController.on('newAccount', (address: string) => {
		console.log(`New account created: ${address}`);
	});
	
	keyringController.on('removedAccount', removeAccount);
	keyringController.on('newVault', newVaultHandler);
	keyringController.on('unlock', unlockHandler);

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

	const createNewVaultAndKeychain = async (e: any) => {
		const result = await keyringController.createNewVaultAndKeychain(password);
		const account = result.keyrings[0].accounts[0];
		console.log("createNewVaultAndKeychain result", result);
		setCurrentAccount(account);
	}

	const submitPassword = async (pwd: string) => {
		const result = await keyringController.submitPassword(pwd);
		console.log('submitPassword result', result);
	}

	const createKeyring = async (e: any) => {
		// testEncryptAndDecrypt();
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
		const keyring = await keyringController.getKeyringForAccount(currentAccount);
		const result = await keyringController.addNewAccount(keyring);
		console.log("addNewAccount result", result.keyrings[0].accounts);
	}

	const getKeyringForAccount = async (e: any) => {
		const result = await keyringController.getKeyringForAccount(currentAccount);
		console.log("getKeyringForAccount result", result);
	}

	const getEncryptionPublicKey = async (e: any) => {
		const publicKey = await keyringController.getEncryptionPublicKey(currentAccount);
		console.log("getEncryptionPublicKey result", publicKey);
	}

	const setLocked = async (e: any) => {
		await keyringController.setLocked();
		console.log("wallet locked");
	}

	const getPrivateKey = async (e: any) => {
		const keyring = await keyringController.getKeyringForAccount(currentAccount);
		const priKey = keyring.wallets[0].privateKey;
		console.log("Private key", priKey);
	}

	const getAccounts = async (e: any) => {
		const accounts = await keyringController.getAccounts();
		console.log("getAccounts result", accounts);
	}

	const initVaultByLocalStore = async (e: any) => {
		// get encrypted secret local stored
		keyringController = new KeyringController({
			keyringTypes: [SimpleKeyring, HdKeyring], // optional array of types to support.
			initState: {vault: encryptedSecret},
			encryptor: undefined,
		})
		console.log(keyringController.store);
		console.log(keyringController.memStore);
		console.log("initVaultByLocalStore succeed, unlock and use it.");
		// 导入的vault必须要unlock，才能使用
	}

	const getEncryptionPublicKeyByWallet = async (e: any) => {
		try {
			const encryptionPublicKey = await window.ethereum.request({
				method: 'wallet_getEncryptionPublicKey',
				params: [currentAccount],
			});
			// const publicKey = Buffer.from(encryptionPublicKey, 'base64').toString("hex");
			// console.log("address:", address)
			console.log("publicKey:" , encryptionPublicKey);
			setEncryptionPublicKey(encryptionPublicKey);
		} catch (error: any) {
			console.log(error);
			setErrorMessage(error.message);
		}
	}

	const encryptMessage = async (e: any) => {
		const enc = sigUtil.encrypt({
			publicKey: encryptionPublicKey,
			data: inputText,
			version: 'x25519-xsalsa20-poly1305',
		})
	
		const encryptedMessage = ethUtil.bufferToHex(stringToUint8Array(JSON.stringify(enc)) as any);
		console.log("encryptedMessage", encryptedMessage)
		setEncryptedMessage(encryptedMessage);
	}

	const decryptMessage = async (e: any) => {
		try {
			const decryptedMessage = await window.ethereum.request({
				method: "eth_decrypt",
				params: [encryptedMessage, currentAccount],
			});
			console.log(decryptedMessage)
			setDecryptedMessage(decryptedMessage);
		} catch (error: any) {
			setErrorMessage(error.message);
			return false;
		}
	}
	
	const stringToUint8Array = (str: string): Uint8Array => {
		let arr = [];
		for (let i = 0, j = str.length; i < j; ++i) {
			arr.push(str.charCodeAt(i));
		}
	
		const tmpUint8Array = new Uint8Array(arr);
		return tmpUint8Array
	}
	

  return (
    <div className="App">
      <header className="App-header">
				<div style={{fontSize: "18px", marginBottom: "10px"}}>{currentAccount}</div>
				{/* <div className="button" onClick={(e) => createKeyring(e)}>Initialize wallet by mnemonic </div>
				<div className="button" onClick={(e) => initVaultByLocalStore(e)}>Initialize wallet by local store </div>
				<div className="button" onClick={(e) => createNewVaultAndKeychain(e)}>Initialize wallet by password </div>
				<div className="button" onClick={(e) => setLocked(e)}>Lock wallet</div>
				<div className="button" onClick={(e) => unlock(e)}>Unlock wallet</div>
				<div className="button" onClick={(e) => verifyPassword(e)}>Verify password</div>
				<div className="button" onClick={(e) => getAccounts(e)}>Get accounts</div>
				<div className="button" onClick={(e) => addNewAccount(e)}>Add a new account</div>
				<div className="button" onClick={(e) => getKeyringForAccount(e)}>Get keyring by address</div>
				<div className="button" onClick={(e) => getEncryptionPublicKey(e)}>Get public key by address</div>
				<div className="button" onClick={(e) => getPrivateKey(e)}>Get private key for 1st address</div> */}
				<div style={{marginTop: "20px"}}>
					<div className="button" onClick={(e) => getEncryptionPublicKeyByWallet(e)}>获取公钥</div>
					<div className="content">Public key： {encryptionPublicKey}</div>
					<input className="input-text" placeholder='输入加密内容' value={inputText} onChange={(e) => setInputText(e.target.value)}></input>
					<div className="button" onClick={(e) => encryptMessage(e)}>加密消息</div>
					<div className="content">Encrypted: {encryptedMessage}</div>
					<div className="button" onClick={(e) => decryptMessage(e)}>解密消息</div>
					<div className="content">Decrypted： {decryptedMessage}</div>
					<div className="error">{errorMessage}</div>
				</div>
      </header>
    </div>
  );
}

export default App;

/**
 * 保存的本地encrypted
{
	"data": "YbrgaWYDV2H8C5bbjQv3nlKhut3hRg4MWOykBAbrlBPTYN/Qh45I9SzMc0nhOvH74CXVXqRz+hEwT/2sOxI+sa1UMC65kggIun4601zUe8ArJPVl8R1cnloA8KRsbwmf/13v40SOwfNhi8YX36FjnNpeofleIqdwgqftbnJeoNXUpmuK/OZHBomT+CsipYSzVEwcEcF5LNv6wXtFIEerShXinK8NMu+cbWR3jw5y8xGWFZDYGByI6Ktg19YUZxVW7bBpHuNwjniOIZH7F0w8vO+Gmr8XzrXGowSwgXFtQ0IddK8XI8Hvw9CYR3PPQsCwjPuIPEaBmTR7bi222pSXyxFksg8NJ2jNFNQ47Ox8S23Nqk8+Lh96QVDNH/pGFCHXN9Fu/tLRuegmCaZOnRMm4pThHWKwB7bZMMrffCuh9V99i/inRNTdDNRkc7HyXLLJAOCzgF6aghUcMZgd8Z822J2DsPMF3SUxeelWq1rNXGfOuZ8E742vi7m2/WgW",
	"iv": "U4k+OrNgKWK1DtJMkTrFHg==",
	"salt": "fVW9zQJS4lzT67Vef+P3iR4eD1PgKr+FX3IzevhCaJs="
}


 */