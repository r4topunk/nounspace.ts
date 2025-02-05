import React, { useEffect, useState } from "react";
import { AvatarImage, Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { IoMdShare } from "react-icons/io";
import { formatNumber } from "@/common/lib/utils/formatNumber";
import { useToken } from "@/common/providers/TokenProvider";

const TokenDataHeader: React.FC = () => {
  const [tokenPrice, setTokenPrice] = useState<string | null>(null);
  const [marketCap, setMarketCap] = useState<string | null>(null);
  const [priceChange, setPriceChange] = useState<string | null>(null);
  const [fetchError] = useState<string | null>(null);
  const { tokenData } = useToken();
  const contractAddress = tokenData?.address || "";
  const name = tokenData?.name || "Loading...";
  const symbol = tokenData?.symbol || "";
  const image = tokenData?.image_url && tokenData.image_url !== "missing.png" ? tokenData.image_url : tokenData?.img_url || null;

  useEffect(() => {
    if (tokenData) {
      setTokenPrice(tokenData.price_usd);
      setMarketCap(
        tokenData.market_cap_usd
          ? formatNumber(parseFloat(tokenData.market_cap_usd))
          : null,
      );
      setPriceChange(tokenData.volume_usd.h24);
    }
  }, [tokenData]);

  const handleAddToMetamask = async () => {
    try {
      const wasAdded = await (window as any).ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: contractAddress,
            symbol: symbol,
            decimals: 18,
            image: image,
          },
        },
      });
      console.log("Token added to MetaMask", wasAdded);
    } catch (error) {
      console.error("Error adding token to MetaMask", error);
    }
  };

  const handleOpenBasescan = () => {
    window.open(`https://basescan.org/address/${contractAddress}`, "_blank");
  };

  const handleCopyUrl = () => {
    const url = window.location.href;
    const tempInput = document.createElement("input");
    tempInput.value = url;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
    alert("URL copied to clipboard");
  };

  return (
    <div className="flex items-center justify-between px-3 md:px-4 py-2 w-full border-b border-b-gray-200 md:border-none">
      <div className="flex items-center space-x-2 md:space-x-4">
        <Avatar
          style={{
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "100%",
            overflow: "hidden",
            backgroundColor: image ? "transparent" : "#ccc",
          }}
        >
          {image ? (
            <AvatarImage
              src={image}
              style={{
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "100%",
                overflow: "hidden",
                backgroundColor: image ? "transparent" : "#ccc",
                objectFit: "cover",
              }}
            />
          ) : (
            <AvatarFallback
              className="text-black font-bold"
              style={{
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "100%",
                overflow: "hidden",
                backgroundColor: image ? "transparent" : "#ccc",
              }}
            >
              {typeof name === "string" ? name.charAt(0) : "?"}
            </AvatarFallback>
          )}
          {name === "nounspace" && (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
              }}
            >
              <img
                src="/images/noggles.png"
                alt="NOGGLES"
                style={{ width: "20px", height: "20px" }}
              />
            </div>
          )}
        </Avatar>
        {/* Token Info */}
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-black">{name}</span>
            <span className="text-gray-500 text-sm">{symbol}</span>
          </div>
          <div className="text-gray-500 text-sm">
            {marketCap ? `$${marketCap}` : "Loading..."}
          </div>
        </div>
      </div>

      {/* Price and Icons */}
      <div className="flex items-center space-x-4">
        {/* Price Details */}
        <div className="text-right">
          <div className="text-black font-bold">
            {tokenPrice !== null ? `$${tokenPrice}` : " "}
          </div>
          <div
            className={`text-sm font-medium ${priceChange && parseFloat(priceChange) > 0
              ? "text-green-500"
              : "text-red-500"
              }`}
          >
            {priceChange
              ? `${(parseFloat(priceChange) / 1000).toFixed(2)}%`
              : "0% "}
          </div>
        </div>
        {/* Action Icons */}
        <div className="hidden md:flex items-center space-x-2">
          <img
            src="https://logosarchive.com/wp-content/uploads/2022/02/Metamask-icon.svg"
            alt="metamask"
            style={{ width: "20px", height: "20px", cursor: "pointer" }}
            onClick={handleAddToMetamask}
          />
          <img
            src="https://cdn.worldvectorlogo.com/logos/etherscan-1.svg"
            alt="basescan"
            style={{ width: "20px", height: "20px", cursor: "pointer" }}
            onClick={handleOpenBasescan}
          />
          <IoMdShare
            className="text-gray-500 cursor-pointer"
            onClick={handleCopyUrl}
          />
        </div>
        <div className="w-0.5 h-12 bg-gray-200 m-5 hidden md:visible" />
      </div>
      {fetchError && <div className="text-red-500">{fetchError}</div>}
    </div>
  );
};

export default TokenDataHeader;