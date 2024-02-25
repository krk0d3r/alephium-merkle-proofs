import { web3, Project, TestContractParams, ContractState, Fields, addressFromContractId, AssetOutput, DUST_AMOUNT, HexString, TestContractResult } from '@alephium/web3'
import { expectAssertionError, randomContractId, testAddress } from '@alephium/web3-test'
import { TokenFaucet, TokenFaucetTypes } from '../../artifacts/ts'

describe('unit tests', () => {
  let testContractId: string
  let testTokenId: string
  let testContractAddress: string
  let testParamsFixture: TestContractParams<TokenFaucetTypes.Fields, {
    amount: bigint
    proof: HexString
    data: HexString
  }>

  let testData = {
    "root": "acbef84bbb442080c75f845e49a60f5ca0881acb8391367834157a483f115be5",
    "proofs": {
      "1": "1a192fabce13988b84994d4296e6cdc418d55e2f1d7f942188d4040b94fc57ac77904f69767ddfdea176c80cefa1181ff9bdc4baf12b0ba9d20255ea59c81a4ef3279b7b7048c0a8885efdaa43eacffc9f7abd3a27941f53f60763f44600ebc6e397b55ba203447e06e7acc480e77d86130626619c81ef5811f3090b9e4f81a2",
      "2": "1d3be50b2bb17407dd170f1d5da128d1def30c6b1598d6a629e79b4775265526505415e5e387342fcc18e607dee3d0426f4b2b47d16c0a5768e0fa355efae67a715e386db63ebfec5be639e9e7ddca1861b7adad62bd6fe7134ccb744bebc088e397b55ba203447e06e7acc480e77d86130626619c81ef5811f3090b9e4f81a2",
      "3": "13600b294191fc92924bb3ce4b969c1e7e2bab8f4c93c3fc6d0a51733df3c060d5f2cc77b02cdfeeb0101a2ef46f583e4a552fe89616f7db273cdb510df4f3d9276577266f830564dc5bca62adf4c808d6ff4396f77115b6c8c4e02ccb099142ff448a2bdc8af60b226ccd7f7150f445c4d79b0729e700073327cd16cc9fd424",
      "4": "2a80e1ef1d7842f27f2e6be0972bb708b9a135c38860dbe73c27c3486c34f4ded5f2cc77b02cdfeeb0101a2ef46f583e4a552fe89616f7db273cdb510df4f3d9276577266f830564dc5bca62adf4c808d6ff4396f77115b6c8c4e02ccb099142ff448a2bdc8af60b226ccd7f7150f445c4d79b0729e700073327cd16cc9fd424",
      "5": "e455bf8ea6e7463a1046a0b52804526e119b4bf5136279614e0b1e8e296a4e2d1219c99b22ee9acd905b8b7805a91b29ace6c3866372231fa7a965b580278968276577266f830564dc5bca62adf4c808d6ff4396f77115b6c8c4e02ccb099142ff448a2bdc8af60b226ccd7f7150f445c4d79b0729e700073327cd16cc9fd424",
      "6": "ceebf77a833b30520287ddd9478ff51abbdffa30aa90a8d655dba0e8a79ce0c11219c99b22ee9acd905b8b7805a91b29ace6c3866372231fa7a965b580278968276577266f830564dc5bca62adf4c808d6ff4396f77115b6c8c4e02ccb099142ff448a2bdc8af60b226ccd7f7150f445c4d79b0729e700073327cd16cc9fd424",
      "7": "e4b1702d9298fee62dfeccc57d322a463ad55ca201256d01f62b45b2e1c21c10d2f8f61201b2b11a78d6e866abc9c3db2ae8631fa656bfe5cb53668255367afb3d524de137338c116f115635b0ab1c5be03e0128d6d512fd4bab97a16609f15dff448a2bdc8af60b226ccd7f7150f445c4d79b0729e700073327cd16cc9fd424",
      "8": "52f1a9b320cab38e5da8a8f97989383aab0a49165fc91c737310e4f7e9821021d2f8f61201b2b11a78d6e866abc9c3db2ae8631fa656bfe5cb53668255367afb3d524de137338c116f115635b0ab1c5be03e0128d6d512fd4bab97a16609f15dff448a2bdc8af60b226ccd7f7150f445c4d79b0729e700073327cd16cc9fd424",
      "9": "44175ac6cd3e7987890f2ca00885c7a88da8e29eac5defa009b73687964e08a03d524de137338c116f115635b0ab1c5be03e0128d6d512fd4bab97a16609f15dff448a2bdc8af60b226ccd7f7150f445c4d79b0729e700073327cd16cc9fd424",
      "10": "c89efdaa54c0f20c7adf612882df0950f5a951637e0307cdcb4c672f298b8bc677904f69767ddfdea176c80cefa1181ff9bdc4baf12b0ba9d20255ea59c81a4ef3279b7b7048c0a8885efdaa43eacffc9f7abd3a27941f53f60763f44600ebc6e397b55ba203447e06e7acc480e77d86130626619c81ef5811f3090b9e4f81a2",
      "11": "7f8b6b088b6d74c2852fc86c796dca07b44eed6fb3daf5e6b59f7c364db14528ccdd2e456d2731b2d38f7364250b5313eb4529956c394474033d5b73db7920fcf3279b7b7048c0a8885efdaa43eacffc9f7abd3a27941f53f60763f44600ebc6e397b55ba203447e06e7acc480e77d86130626619c81ef5811f3090b9e4f81a2",
      "12": "7880aec93413f117ef14bd4e6d130875ab2c7d7d55a064fac3c2f7bd51516380ccdd2e456d2731b2d38f7364250b5313eb4529956c394474033d5b73db7920fcf3279b7b7048c0a8885efdaa43eacffc9f7abd3a27941f53f60763f44600ebc6e397b55ba203447e06e7acc480e77d86130626619c81ef5811f3090b9e4f81a2",
      "13": "5c4c6aa067b6f8e6cb38e6ab843832a94d1712d661a04d73c517d6a1931a9e5dd763995b78511ab89a9449e08451197af90a22042a2159e0d2e42d6ab9534b26715e386db63ebfec5be639e9e7ddca1861b7adad62bd6fe7134ccb744bebc088e397b55ba203447e06e7acc480e77d86130626619c81ef5811f3090b9e4f81a2",
      "14": "789bcdf275fa270780a52ae3b79bb1ce0fda7e0aaad87b57b74bb99ac290714ad763995b78511ab89a9449e08451197af90a22042a2159e0d2e42d6ab9534b26715e386db63ebfec5be639e9e7ddca1861b7adad62bd6fe7134ccb744bebc088e397b55ba203447e06e7acc480e77d86130626619c81ef5811f3090b9e4f81a2",
      "15": "ad7c5bef027816a800da1736444fb58a807ef4c9603b7848673f7e3a68eb14a5505415e5e387342fcc18e607dee3d0426f4b2b47d16c0a5768e0fa355efae67a715e386db63ebfec5be639e9e7ddca1861b7adad62bd6fe7134ccb744bebc088e397b55ba203447e06e7acc480e77d86130626619c81ef5811f3090b9e4f81a2"
    }
  }

  // We initialize the fixture variables before all tests
  beforeAll(async () => {
    web3.setCurrentNodeProvider('http://127.0.0.1:22973', undefined, fetch)
    await Project.build()
    testContractId = randomContractId()
    testTokenId = testContractId
    testContractAddress = addressFromContractId(testContractId)
    testParamsFixture = {
      // a random address that the test contract resides in the tests
      address: testContractAddress,
      // assets owned by the test contract before a test
      initialAsset: { alphAmount: 10n ** 18n, tokens: [{ id: testTokenId, amount: 10n }] },
      // initial state of the test contract
      initialFields: {
        symbol: Buffer.from('TF', 'utf8').toString('hex'),
        name: Buffer.from('TokenFaucet', 'utf8').toString('hex'),
        decimals: 18n,
        supply: 10n ** 18n,
        balance: 10n,
        merkleRoot: testData.root
      },
      // arguments to test the target function of the test contract
      testArgs: { amount: 1n, proof: "1f675bff07515f5df96737194ea945c36c41e7b4fcef307b7cd4d0e602a69111e62e1dfc08d58fd144947903447473a090c958fe34e2425d578237fcdf1ab5a4434b529473163ef4ed9c9341d9b7250ab9183c27e7add004c3bba38c56274e24", data: Buffer.from('A').toString("hex") },
      // assets owned by the caller of the function
      inputAssets: [{ address: testAddress, asset: { alphAmount: 10n ** 18n } }]
    }
  })

  it('test withdraw for 1', async () => {
    const testParams = {
      ...testParamsFixture, testArgs: {
        amount: 1n,
        proof: testData.proofs["1"],
        data: Buffer.from("1").toString("hex")
      }
    }
    const testResult = await TokenFaucet.tests.withdraw(testParams)
    verifyTestRestult(testResult, 1n)
  })


  it('test withdraw for 2', async () => {
    const testParams = {
      ...testParamsFixture, testArgs: {
        amount: 1n,
        proof: testData.proofs["2"],
        data: Buffer.from("2").toString("hex")
      }
    }
    const testResult = await TokenFaucet.tests.withdraw(testParams)
    verifyTestRestult(testResult, 1n)
  })

  it('test withdraw for 3', async () => {
    const testParams = {
      ...testParamsFixture, testArgs: {
        amount: 1n,
        proof: testData.proofs["3"],
        data: Buffer.from("3").toString("hex")
      }
    }
    const testResult = await TokenFaucet.tests.withdraw(testParams)
    verifyTestRestult(testResult, 1n)
  })

  it('test withdraw for 4', async () => {
    const testParams = {
      ...testParamsFixture, testArgs: {
        amount: 1n,
        proof: testData.proofs["4"],
        data: Buffer.from("4").toString("hex")
      }
    }
    const testResult = await TokenFaucet.tests.withdraw(testParams)
    verifyTestRestult(testResult, 1n)
  })

  it('test withdraw for 5', async () => {
    const testParams = {
      ...testParamsFixture, testArgs: {
        amount: 1n,
        proof: testData.proofs["5"],
        data: Buffer.from("5").toString("hex")
      }
    }
    const testResult = await TokenFaucet.tests.withdraw(testParams)
    verifyTestRestult(testResult, 1n)
  })

  it('test withdraw for 15', async () => {
    const testParams = {
      ...testParamsFixture, testArgs: {
        amount: 1n,
        proof: testData.proofs["15"],
        data: Buffer.from("15").toString("hex")
      }
    }
    const testResult = await TokenFaucet.tests.withdraw(testParams)
    verifyTestRestult(testResult, 1n)
  })


  it('test withdraw for 16 should fail', async () => {
    const testParams = {
      ...testParamsFixture, testArgs: {
        amount: 1n,
        proof: testData.proofs["15"],
        data: Buffer.from("16").toString("hex")
      }
    }
    await expectAssertionError(TokenFaucet.tests.withdraw(testParams), testContractAddress, 1)
  })

  it('test withdraw for 15 should fail', async () => {
    const testParams = {
      ...testParamsFixture, testArgs: {
        amount: 1n,
        proof: testData.proofs["7"],
        data: Buffer.from("15").toString("hex")
      }
    }
    await expectAssertionError(TokenFaucet.tests.withdraw(testParams), testContractAddress, 1)
  })

  it('test update', async () => {
    const testUpdateParams = {
      ...testParamsFixture, testArgs: {
        newMerkleRoot: "e506a5dc6d9907dc6995d997b079602e03375ec1f045f32464b492de30ed046f"
      }
    }
    const testResult = await TokenFaucet.tests.updateMerkleRoot(testUpdateParams)
    const tokenFaucet = getContractState<TokenFaucetTypes.Fields>(testResult.contracts, testContractId)
    expect(tokenFaucet.fields.merkleRoot).toEqual("e506a5dc6d9907dc6995d997b079602e03375ec1f045f32464b492de30ed046f")
  })

  it('test withdraw new address added', async () => {
    const testWithdrawParams = {
      ...testParamsFixture, testArgs: {
        amount: 1n,
        proof: "cceff82a5652baa50642d640db68a1ef25b645394d1f1f5b73638af098cd7901ff47f006a916075054e19e52e0cd950645fe652bf574851e4b1f3ba94d65bfb7abc8f2170ef827390c9cb2ad8277f2a8be3e61c053a5901db7d212fefbfeb21e",
        data: Buffer.from("199QZVT8bLkYNZ7d2xoHbip29yD18tdeHDPjB7cyx9ofi").toString("hex")
      }, initialFields: {
        ...testParamsFixture.initialFields,
        merkleRoot: "e506a5dc6d9907dc6995d997b079602e03375ec1f045f32464b492de30ed046f"
      }
    }
    const testWithdrawResult = await TokenFaucet.tests.withdraw(testWithdrawParams)
    verifyTestRestult(testWithdrawResult, 1n)
  })

  function getContractState<T extends Fields>(contracts: ContractState[], contractId: string): ContractState<T> {
    return contracts.find((c) => c.contractId === contractId)! as ContractState<T>
  }

  function verifyTestRestult(testResult: TestContractResult<null>, amount: bigint) {
    // a `Withdraw` event is emitted when the test passes
    expect(testResult.events.length).toEqual(1)
    const event = testResult.events[0] as TokenFaucetTypes.WithdrawEvent
    // the event is emitted by the test contract
    expect(event.contractAddress).toEqual(testContractAddress)
    // the name of the event is `Withdraw`
    expect(event.name).toEqual('Withdraw')
    // the first field of the event
    expect(event.fields.to).toEqual(testAddress)
    // the second field of the event
    expect(event.fields.amount).toEqual(amount)
  }
})
