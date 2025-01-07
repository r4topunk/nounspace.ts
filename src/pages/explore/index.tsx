"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/common/components/atoms/tabs";
import { getAllMarkdownFiles } from "@/common/data/explore/loadExploreMarkdown";
import {
  tabContentClasses,
  tabListClasses,
  tabTriggerClasses,
} from "@/common/lib/theme/helpers";
import { trackAnalyticsEvent } from "@/common/lib/utils/analyticsUtils";
import { AnalyticsEvent } from "@/common/providers/AnalyticsProvider"; // Import analytics
import { groupBy } from "lodash";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  ChartNoAxesColumn,
  ChartNoAxesColumnDecreasing,
  ChartNoAxesColumnIncreasing,
  CircleDollarSign,
  Clock,
  Flame,
  User,
} from "lucide-react";
import { Address } from "viem";
import { FaFilterCircleDollar } from "react-icons/fa6";

export async function getStaticProps() {
  const posts = await getAllMarkdownFiles();
  return {
    props: {
      posts,
    },
  };
}

const categories = [
  { title: "Nounish", image: "/images/explore-icons/nounish.png" },
  { title: "DeFi", image: "/images/explore-icons/defi.png" },
  { title: "Art", image: "/images/explore-icons/art.png" },
  { title: "Farcaster", image: "/images/explore-icons/farcaster.png" },
  { title: "Games", image: "/images/explore-icons/games.png" },
  { title: "Music", image: "/images/explore-icons/music.png" },
  { title: "AI", image: "/images/explore-icons/ai.png" },
  { title: "Public Goods", image: "/images/explore-icons/public-goods.png" },
  { title: "People", image: "/images/explore-icons/people.png" },
];

export default function Explore({ posts }) {
  // const { homebaseConfig } = useAppStore((state) => ({
  //   homebaseConfig: state.homebase.homebaseConfig,
  // }));
  const groupedPosts = groupBy(posts, (post) => post.category);

  return (
    <div className="min-h-screen max-w-screen max-h-screen h-screen w-screen p-5 overflow-y-scroll">
      <Tabs defaultValue="tokens" className="max-h-full">
        <TabsList className={tabListClasses}>
          <TabsTrigger value="tokens" className={tabTriggerClasses}>
            Tokens
          </TabsTrigger>
          <TabsTrigger value="spaces" className={tabTriggerClasses}>
            Spaces
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tokens" className={tabContentClasses}>
          <div className="transition-all duration-100 ease-out max-h-full overflow-y-scroll grid grid-rows-[auto_1fr]">
            <ExploreHeader
              title="Explore Clanker Tokens"
              image="/images/clanker_galaxy.png"
            />
            <TokensGrid />
          </div>
        </TabsContent>
        <TabsContent value="spaces" className={tabContentClasses}>
          <div className="flex w-full h-full">
            <div className="w-full transition-all duration-100 ease-out h-full grid grid-rows-[auto_1fr]">
              <ExploreHeader
                title="Explore Featured Spaces"
                image="/images/rainforest.png"
              />
              <CategoriesGrid
                categories={categories}
                groupedPosts={groupedPosts}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
const ExploreHeader = ({ title, image }) => {
  return (
    <div className="min-h-48 rounded-lg relative overflow-hidden grid grid-cols-1 grid-rows-1 place-content-center">
      <Image
        src={image}
        alt={title}
        fill
        className="col-span-1 row-span-1 object-cover object-bottom"
      />
      <div className="col-span-1 row-span-1 z-10 text-center font-bold text-white grid place-content-center text-4xl">
        {title}
      </div>
    </div>
  );
};

const CategoriesGrid = ({ categories, groupedPosts }) => {
  return (
    <div className="grid grid-cols-1 gap-8 mt-5 overflow-auto">
      {categories.map(({ title, image }) => {
        if (!groupedPosts[title]) return null;

        return (
          <div
            key={title}
            className="flex flex-col gap-4 border-b border-b-slate-200 pb-8 last:border-b-0 last:pb-0"
          >
            <h2 className="text-2xl font-bold flex flex-row gap-4 items-center">
              <Image
                src={image}
                alt={title}
                width={48}
                height={48}
                className="shrink-0"
              />
              {title}
            </h2>
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {groupedPosts[title].map((post, i) => (
                <ExploreCard key={`${post.slug}-${i}`} post={post} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ExploreCard = ({ post }) => {
  return (
    <Link
      onClick={() => {
        trackAnalyticsEvent(AnalyticsEvent.CLICK_EXPLORE_CARD, {
          slug: post.slug,
        });
      }}
      href={`/s/${post.slug}`}
      className="block border border-gray-300 rounded-lg overflow-hidden bg-[#FCFFF4] hover:shadow-md transition-all duration-100 ease-out hover:-translate-y-1"
    >
      <div className="h-36 w-full bg-gray-200 overflow-hidden relative">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover object-center"
        />
      </div>
      <div className="p-3">
        <h2 className="text-lg font-bold">@{post.title}</h2>
      </div>
    </Link>
  );
};

export interface Token {
  name: string;
  address: Address;
  symbol: string;
  imageUrl?: string;
  deployer: {
    username: string;
    avatarUrl: string;
    followers: number;
    score: number;
  };
  deployedAt: string;
  marketCap: number;
  volumeLastHour: number;
  priceChange: number;
}

function TokensGrid() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchTokens = async () => {
      const res = await fetch(
        `https://clanker-terminal.vercel.app/api/tokens?page=${page}`,
      );
      const data = await res.json();
      setTokens(data);
    };
    fetchTokens();
    // Automatically fetch new tokens every minute
    // const interval = setInterval(fetchTokens, 60000);
    // return () => clearInterval(interval);
  }, [page]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 mt-6">
      {tokens.map((token) => (
        <TokenCard key={token.address} token={token} />
      ))}
    </div>
  );
}

export function TokenCard({ token }: { token: Token }) {
  const timeAgo = formatDistanceToNow(new Date(token.deployedAt), {
    addSuffix: true,
  });

  return (
    <div className="ease-out flex flex-col justify-between bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link
        href={`/t/base/${token.address}`}
        className="block"
        target="_blank"
        prefetch={false}
      >
        <div className="relative h-48">
          <Image
            key={token.name}
            src={token?.imageUrl || token.deployer?.avatarUrl || ""}
            alt={token.name}
            className="w-full h-full object-cover"
            width={500}
            height={500}
          />
          <div className="absolute top-4 right-4 bg-black/70 dark:bg-gray-700 px-3 py-1 rounded-full">
            <span className="text-white dark:text-gray-200 font-medium">
              {token.symbol}
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {token.name}
            </h3>
            <div className="flex items-center space-x-1">
              {token.priceChange === 0 ? (
                <ChartNoAxesColumn className="w-5 h-5 text-gray-900 dark:text-gray-100" />
              ) : token.priceChange < 0 ? (
                <ChartNoAxesColumnDecreasing className="w-5 h-5 text-red-500 dark:text-red-400" />
              ) : (
                <ChartNoAxesColumnIncreasing className="w-5 h-5 text-green-500 dark:text-green-400" />
              )}
              <span className="font-semibold text-muted-foreground">
                {token.priceChange.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                %
              </span>
            </div>
            {/* <div className="flex items-center space-x-1"> */}
            {/* <Trophy className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {token.deployer.score}
              </span> */}
            {/* </div> */}
          </div>
        </div>
      </Link>

      <div className="px-6 pb-6">
        {token.deployer.username == "Unknown" ? (
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Anon deployer
          </p>
        ) : (
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center hover:opacity-80 cursor-pointer">
              <Image
                src={token.deployer?.avatarUrl || ""}
                alt={token.deployer.username}
                className="w-8 h-8 rounded-full mr-2 object-cover bg-gray-400"
                width={32}
                height={32}
              />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  @{token.deployer.username}
                </p>
                <p className="text-xs text-muted-foreground">
                  {token.deployer.followers.toLocaleString()} followers
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {token.deployer.score}
              </span>
            </div>
          </div>
        )}

        <div className="flex items-end justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1 text-muted-foreground" />
            <span>{timeAgo}</span>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center">
              <Flame className="w-4 h-4 mr-1 text-muted-foreground" />
              <span>
                $
                {token.volumeLastHour.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex items-center">
              <CircleDollarSign className="w-4 h-4 mr-1 text-muted-foreground" />
              <span>
                $
                {token.marketCap.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
