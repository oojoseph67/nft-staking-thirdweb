import { useAddress, useMetamask, useNFTDrop } from "@thirdweb-dev/react";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const Mint = () => {
  const router = useRouter();
  return (
    <div>
      <iframe
        src="https://gateway.ipfscdn.io/ipfs/QmRJ1qPfNF3aaVymeTFQfKs55R3gZ5GeXNc9HzB9x6VGXN/nft-drop.html?contract=0xBfA75033b059134993A89ba9063bdF7744cfe139&chainId=5&primaryColor=purple"
        width="600px"
        height="600px"
        frameBorder="0"
      ></iframe>
    </div>
  );
};

export default Mint;
