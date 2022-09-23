import {
  ThirdwebNftMedia,
  useAddress,
  useMetamask,
  useNFTDrop,
  useToken,
  useTokenBalance,
  useOwnedNFTs,
  useContract,
  useNFTCollection,
} from "@thirdweb-dev/react";
import { BigNumber, ethers } from "ethers";
import type { NextPage } from "next";
import { useEffect, useState } from "react";

const nftDropContractAddress = "0xBfA75033b059134993A89ba9063bdF7744cfe139";
const tokenContractAddress = "0x8f73e22Af7962E5214Cb3d5e8D1ECb74c21FA303";
const stakingContractAddress = "0xdC75154072F6E96BF2Cd05701F740A46A28f417b";

const Stake: NextPage = () => {
  // Wallet Connection Hooks
  const address = useAddress();
  const connectWithMetamask = useMetamask();

  // Contract Hooks
  const nftDropContract = useNFTCollection(nftDropContractAddress);
  const tokenContract = useToken(tokenContractAddress);

  const { contract, isLoading } = useContract(stakingContractAddress);

  // Load Unstaked NFTs
  const { data: ownedNfts } = useOwnedNFTs(nftDropContract, address);

  // Load Balance of Token
  const { data: tokenBalance } = useTokenBalance(tokenContract, address);

  ///////////////////////////////////////////////////////////////////////////
  // Custom contract functions
  ///////////////////////////////////////////////////////////////////////////
  const [stakedNfts, setStakedNfts] = useState<any[]>([]);
  const [claimableRewards, setClaimableRewards] = useState<BigNumber>();

  useEffect(() => {
    if (!contract) return;

    async function loadStakedNfts() {
      const stakedTokens = await contract?.call("getStakedTokens", address);

      // For each staked token, fetch it from the sdk
      const stakedNfts = await Promise.all(
        stakedTokens?.map(
          async (stakedToken: { staker: string; tokenId: BigNumber }) => {
            const nft = await nftDropContract?.get(stakedToken.tokenId);
            return nft;
          }
        )
      );

      setStakedNfts(stakedNfts);
      console.log("setStakedNfts", stakedNfts);
    }

    if (address) {
      loadStakedNfts();
    }
  }, [address, contract, nftDropContract]);

  useEffect(() => {
    if (!contract || !address) return;

    async function loadClaimableRewards() {
      const cr = await contract?.call("availableRewards", address);
      console.log("Loaded claimable rewards", cr);
      setClaimableRewards(cr);
    }

    loadClaimableRewards();
  }, [address, contract]);

  ///////////////////////////////////////////////////////////////////////////
  // Write Functions
  ///////////////////////////////////////////////////////////////////////////
  async function stakeNft(id: BigNumber) {
    if (!address) return;

    const isApproved = await nftDropContract?.isApproved(
      address,
      stakingContractAddress
    );
    // If not approved, request approval
    if (!isApproved) {
      await nftDropContract?.setApprovalForAll(stakingContractAddress, true);
    }
    const stake = await contract?.call("stake", id);
  }

  async function withdraw(id: BigNumber) {
    const withdraw = await contract?.call("withdraw", id);
  }

  async function claimRewards() {
    const claim = await contract?.call("claimRewards");
  }

  if (isLoading) {
    return <div>Loading</div>;
  }

  return (
    <div>
      <h1>Stake Your NFTs</h1>

      <hr></hr>

      {!address ? (
        <button  onClick={connectWithMetamask}>
          Connect Wallet
        </button>
      ) : (
        <div>
          <h2>Your Tokens</h2>

          <div>
            <div>
              <h3>Claimable Rewards</h3>
              <p>
                <b>
                  {!claimableRewards
                    ? "Loading..."
                    : ethers.utils.formatUnits(claimableRewards, 18)}
                </b>{" "}
                {tokenBalance?.symbol}
              </p>
            </div>
            <div>
              <h3>Current Balance</h3>
              <p>
                <b>{tokenBalance?.displayValue}</b> {tokenBalance?.symbol}
              </p>
            </div>
          </div>

          <button
            onClick={() => claimRewards()}
          >
            Claim Rewards
          </button>

          <hr></hr>

          <h2>Your Staked NFTs</h2>
          <div>
            {stakedNfts?.map((nft) => (
              <div key={nft.metadata.id.toString()}>
                <ThirdwebNftMedia
                  metadata={nft.metadata}
                />
                <h3>{nft.metadata.name}</h3>
                <button
                  onClick={() => withdraw(nft.metadata.id)}
                >
                  Withdraw
                </button>
              </div>
            ))}
          </div>

          <hr></hr>

          <h2>Your Unstaked NFTs</h2>

          <div>
            {ownedNfts?.map((nft) => (
              <div key={nft.metadata.id.toString()}>
                <ThirdwebNftMedia
                  metadata={nft.metadata}
                />
                <h3>{nft.metadata.name}</h3>
                <button
                  onClick={() => stakeNft(nft.metadata.id)}
                >
                  Stake
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Stake;
