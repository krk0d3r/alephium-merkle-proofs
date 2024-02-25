import { DUST_AMOUNT, ExecuteScriptResult, SignerProvider } from '@alephium/web3'
import { Update, Withdraw } from '../../artifacts/ts/scripts'
import { TokenFaucet, TokenFaucetTypes } from '../../artifacts/ts/TokenFaucet'

export const withdrawToken = async (
  signerProvider: SignerProvider,
  amount: string,
  tokenId: string,
  proof: string,
  data: string
): Promise<ExecuteScriptResult> => {
  return await Withdraw.execute(signerProvider, {
    initialFields: {
      token: tokenId,
      amount: BigInt(amount),
      proof: proof,
      data: data
    },
    attoAlphAmount: DUST_AMOUNT
  })
}

export const updateMerkleRoot = async (
  signerProvider: SignerProvider,
  tokenId: string,
  newMerkleRoot: string
): Promise<ExecuteScriptResult> => {
  return await Update.execute(signerProvider, {
    initialFields: {
      token: tokenId,
      newMerkleRoot: newMerkleRoot
    },
    attoAlphAmount: DUST_AMOUNT
  })
}


export const getTokenFaucetState = async (
  contractAddress: string
): Promise<TokenFaucetTypes.State> => {
  return await TokenFaucet.at(contractAddress).fetchState()
}