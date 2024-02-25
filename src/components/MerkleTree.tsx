import React, { ChangeEvent, useCallback } from 'react'
import { FC, useState, useEffect } from 'react'
import styles from '../styles/Home.module.css'
import { updateMerkleRoot, getTokenFaucetState } from '@/services/token.service'
import { TxStatus } from './TxStatus'
import { useWallet } from '@alephium/web3-react'
import { node, web3 } from '@alephium/web3'
import { TokenFaucetConfig } from '@/services/utils'
import keccak256 from 'keccak256';


export const MerkleTree: FC<{
  config: TokenFaucetConfig
}> = ({ config }) => {
  const { signer, account, nodeProvider } = useWallet()
  if (nodeProvider) {
    web3.setCurrentNodeProvider(nodeProvider)
  }
  const addressGroup = config.groupIndex
  const [ongoingTxId, setOngoingTxId] = useState<string>()

  const [inputValue, setInputValue] = useState<string>('1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH,16VPvbF1ShQsj8TappJWtoW6gRM1AEQXYqwo5rQ7BiAy3,17cBiTcWhung3WDLuc9ja5Y7BMus5Q7CD9wYBxS1r1P2R,15jjExDyS8q3Wqk9v29PCQ21jDqubDrD8WQdgn6VW2oi4');
  const [elements, setElements] = useState<string[]>([]);
  const [merkleRoot, setMerkleRoot] = useState<string>('');
  const [currentRoot, setCurrentRoot] = useState<string>('');
  const [proofs, setProofs] = useState<Record<string, string>>({});


  useEffect(() => {
    const state = getTokenFaucetState(config.tokenFaucetAddress).then(x => {
      setCurrentRoot(x.fields.merkleRoot)
    })
  }, []);

  const hash = (data: Buffer): Buffer => keccak256(data);

  const hashPair = (a: Buffer, b: Buffer): Buffer => {
    return hash(Buffer.concat([a, b].sort(Buffer.compare)));
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = () => {
    if (!inputValue.trim()) {
      alert('Please enter comma-separated values.');
      return;
    }
    const newElements = inputValue.split(',').map(el => el.trim());
    setElements(newElements);
    generateMerkleTree(newElements);
  };

  const updateTree = async (e: React.FormEvent) => {
    e.preventDefault()
    if (signer) {
      const result = await updateMerkleRoot(signer, config.faucetTokenId, merkleRoot)
      setOngoingTxId(result.txId)
    }
  }

  const txStatusCallback = useCallback(
    async (status: node.TxStatus, numberOfChecks: number): Promise<any> => {
      if ((status.type === 'Confirmed' && numberOfChecks > 2) || (status.type === 'TxNotFound' && numberOfChecks > 3)) {
        setOngoingTxId(undefined)
      }

      return Promise.resolve()
    },
    [setOngoingTxId]
  )

  const generateMerkleTree = (elements: string[]) => {
    const sortedElements = [...elements].sort();
    let level = sortedElements.map(e => hash(Buffer.from(e, 'utf-8')));

    const tree: Buffer[][] = [];
    while (level.length > 1) {
      tree.push(level);
      level = level.reduce<Buffer[]>((acc, _, i, arr) => {
        if (i % 2 === 0) {
          acc.push(i + 1 < arr.length ? hashPair(arr[i], arr[i + 1]) : arr[i]);
        }
        return acc;
      }, []);
    }
    tree.push(level); // Root

    const generatedProofs = sortedElements.reduce<Record<string, string>>((acc, element, elementIndex) => {
      const elementHash = tree[0][elementIndex];

      const proof = tree.slice(0, -1).reduce<Buffer[]>((proofAcc, level, levelIndex) => {
        const index = Math.floor(elementIndex / (2 ** levelIndex));
        const pairIndex = index % 2 === 0 ? index + 1 : index - 1;
        const siblingOrUncle = level[pairIndex];

        if (siblingOrUncle) {
          proofAcc.push(siblingOrUncle);
        }

        return proofAcc;
      }, []);

      acc[element] = proof.map(hash => hash.toString('hex')).join('');
      return acc;
    }, {});

    console.log({
      root: tree[tree.length - 1][0].toString('hex'),
      proofs: generatedProofs
    })

    setMerkleRoot(tree[tree.length - 1][0].toString('hex'));
    setProofs(generatedProofs);
  };

  return (
    <div>
      <h1>Merkle Tree Generator</h1>
      <h2>Current Merkle Root in Contract {currentRoot}</h2>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Enter values separated by commas"
      />
      <button onClick={handleSubmit}>Generate Merkle Tree</button>
      <div>
        <h2>Merkle Root: {merkleRoot}</h2>
        {merkleRoot && (
          <div>
            <button onClick={updateTree}>Update Merkle Root</button>
            {ongoingTxId && <TxStatus txId={ongoingTxId} txStatusCallback={txStatusCallback} />}
          </div>
        )}
        <div>
          {Object.entries(proofs).map(([element, proof]) => (
            <div key={element}>
              <h3>Proof for {element}:</h3>
              <p>{proof}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MerkleTree;
