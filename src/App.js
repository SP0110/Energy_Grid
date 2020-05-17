import React, { Component } from 'react';
import DataStorageContract from './build/contracts/DataStorageContract.json'
import getWeb3 from './utils/getWeb3'
import ipfs from './ipfs'
import './App.css';

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      ipfsHash: '',
      buffer: [],
      account: null,
      todos: {},
      obj: {}
    }
    this.captureFile = this.captureFile.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
    this.get = this.get.bind(this)
  }

  componentDidMount() {
    getWeb3
      .then(results => {
        this.setState({
          web3: results.web3
        })
        // Instantiate contract once web3 provided.
        this.instantiateContract()
      })
      .catch(() => {
        console.log('Error finding web3.')
      })
  }

  instantiateContract() {
    const truffleContract = require('truffle-contract')
    const dataStorageContract = truffleContract(DataStorageContract)
    dataStorageContract.setProvider(this.state.web3.currentProvider)

    this.state.web3.eth.getAccounts((error, accounts) => {
      dataStorageContract.deployed().then((instance) => {
        this.dataStorageContractInstance = instance
        this.setState({ account: accounts[0] })
        return this.dataStorageContractInstance.getConsumptionHash.call({ from: accounts[0] })
      }).then((ipfsHash) => {
        return this.setState({ ipfsHash })
      })
    })
  }

  async captureFile(event) {
    event.preventDefault()

   
    const obj = { "Meter_id": "1", "Reading": 600, "Time-stamp": "2020:03:16 12:00:00" } 
  
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' })
    const file = new File([blob], null, { type: "application/json" })

    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
// buffer conversion
    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) })
      console.log('buffer', this.state.buffer)
    }
  }

  async onSubmit(event) {
    event.preventDefault()
//ipfs storage
    ipfs.files.add(this.state.buffer, async(error, result) => {
      if (error) {
        console.error("err:", error)
        return
      }
//hash storage in blockchain
      await this.dataStorageContractInstance.setConsumptionHash(result[0].hash, { from: this.state.account }).then( async (r) => {
        await console.log('ifpsHash', this.state.ipfsHash)
        return this.setState({ ipfsHash: result[0].hash })
      })
    })
    await console.log(this.state.ipfsHash)

    fetch(`http://127.0.0.1:8080/ipfs/${this.state.ipfsHash}`)
    .then(res => res.json())
    .then(async (data) => {
      this.setState({ todos: data })
      console.log("todos",this.state.todos)
    })
    .catch(console.log)
  }

  async get(event){
    event.preventDefault()
    fetch(`http://127.0.0.1:8080/ipfs/${this.state.ipfsHash}`)
    .then(res => res.json())
    .then(async (data) => {
      this.setState({ todos: data })
      console.log("todos",this.state.todos)
    })
    .catch(console.log)
  }

  render() {
    return (
      <div>
        <h1>COGNITIVE ENERGY GRID</h1>
        <form onSubmit={this.onSubmit}>
          <input type='file' onChange={this.captureFile} />
          <button onClick={this.get}>get json</button>
          <input type='submit' />
        </form>
      </div>
    );
  }
}

export default App;
