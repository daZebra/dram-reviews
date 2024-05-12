import SearchForm from "@/components/search-form";
import Tags from "@/components/tags";
import {
  CheckIcon,
  Cross1Icon,
  HeartIcon,
  QuoteIcon,
  StarFilledIcon,
  TargetIcon,
} from "@radix-ui/react-icons";
import Image from "next/image";
import { Nanum_Pen_Script } from "next/font/google";
import ProfilePictures from "@/components/profile-pictures";
import LottiImg from "@/components/lottie-img";

const nanumPenScript = Nanum_Pen_Script({
  weight: ["400"],
  subsets: ["latin"],
});

type HomeProps = {
  searchParams: { search: string | undefined };
};
export default function Home({ searchParams }: HomeProps) {
  // const { search } = searchParams;

  return (
    <main className="flex flex-col items-center ">
      {/* Hero Section */}
      <section className=" text-center flex flex-col items-center gap-4 max-w-sm md:max-w-2xl">
        <div className="flex flex-col items-center gap-1 pt-12 pb-4">
          <ProfilePictures
            urls={[
              "https://i.ytimg.com/vi/-IB0gkLjSHs/mqdefault.jpg",
              "https://i.ytimg.com/vi/GbSSHRJt0uk/mqdefault.jpg",
              "https://i.ytimg.com/vi/U2jC7wDX2ZE/mqdefault.jpg",
              "https://i.ytimg.com/vi/nCvzGSxGDg4/mqdefault.jpg",
              "https://i.ytimg.com/vi/yAKqje23Yuo/mqdefault.jpg",
            ]}
          />

          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((item, i) => (
              <StarFilledIcon key={i} className="text-accent" />
            ))}
          </div>
          <p className="text-base-content/40 text-sm font-medium">
            Loved by 1,000s of whisky lovers
          </p>
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold ">
          Discover Your Next Favorite Whisky
        </h1>
        <p className="text-lg text-base-content/60 max-w-lg">
          Effortlessly explore over 20,000+ whiskies based on insights and
          summaries from top whisky reviewers.
        </p>
        <SearchForm />
        <div className="flex flex-col gap-4 items-center">
          <div className="hidden md:flex md:text-nowrap pt-2 gap-x-4 text-sm text-base-content/60">
            <p>Recent searches:</p>
            <Tags />
          </div>
          <div className="flex gap-1 items-end justify-end">
            <Image
              src="/arrow-up.svg"
              alt="image"
              width={20}
              height={20}
              className="mb-2"
            />
            <span className={`${nanumPenScript.className} text-xl`}>
              Try it
            </span>
          </div>
        </div>

        <Image
          src="/whisky-review-highland-park.png"
          alt="image"
          width={800}
          height={800}
          className="w-full"
        />
      </section>
      {/* Problem Section */}
      <section className="flex justify-center w-full gap-10">
        <div className="relative h-full py-40 w-full bg-white ">
          <div className="flex flex-col items-center gap-8 px-4 z-10 max-w-5xl mx-auto">
            <h2 className="text-3xl text-base-content font-bold font-serif text-center capitalize max-w-xl ">
              Finding the perfect dram for your palate has never been easier{" "}
            </h2>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex flex-col gap-4 border border-error p-8 rounded-xl md:w-1/2  bg-white">
                <h3 className="text-xl font-bold font-serif text-center">
                  The Old Way
                </h3>
                <ul className="flex flex-col gap-2">
                  <ListItem sign={false}>
                    Peer reviews vary widely in quality and relevance, making it
                    difficult to gauge a whisky&#39;s true character.
                  </ListItem>
                  <ListItem sign={false}>
                    Expert insights are valuable but buried in lengthy videos or
                    articles, taking forever to get to what matters.
                  </ListItem>
                  <ListItem sign={false}>
                    Finding whiskies that are right for your palate involves a
                    lot of costly trial-and-error.{" "}
                  </ListItem>
                </ul>
              </div>

              <div className="flex flex-col gap-4 border border-success p-8 rounded-xl md:w-1/2 bg-white ">
                <h3 className="text-xl font-bold font-serif text-center">
                  The New Way
                </h3>
                <ul className="flex flex-col gap-2">
                  <ListItem sign={true}>
                    See what top reviewers have to say about over 20,000
                    bottles.{" "}
                  </ListItem>
                  <ListItem sign={true}>
                    Enjoy structured insights without the fluff.
                  </ListItem>
                  <ListItem sign={true}>
                    Explore whiskies that match your taste seamlessly.{" "}
                  </ListItem>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VP1 Section */}
      <HomeSection
        sectionTitle="All the Whisky Info You Need, None You Don&#39;t"
        sectionParagraph="Get straight to the point with streamlined summaries from expert
        reviewers, designed to quickly guide your next purchase."
        imgPath="/lottie-whisky-details.json"
      >
        <span className="md:flex w-8 h-8 rounded-md bg-primary justify-center items-center shadow-md shadow-primary/50 hidden md:visible">
          <TargetIcon className="w-6 h-6 text-white" />
        </span>
      </HomeSection>

      {/* VP2 Section */}
      <HomeSection
        sectionTitle="Hear It Straight From The Experts"
        sectionParagraph="Direct insights from top whisky experts, enhancing your selection
        process with trusted opinions."
        imgPath="/lottie-quotes.json"
      >
        <span className="md:flex w-8 h-8 rounded-md bg-accent justify-center items-center shadow-md shadow-accent/50 hidden md:visible">
          <QuoteIcon className="w-6 h-6 text-white " />
        </span>
      </HomeSection>

      {/* VP3 Section */}
      <HomeSection
        sectionTitle="Your Go-To Whisky Discovery Tool"
        sectionParagraph="Use our smart search to find whiskies by taste, cask, or age —
        perfectly tailored to your preferences."
        imgPath="/lottie-filters.json"
      >
        <span className="md:flex w-8 h-8 rounded-md bg-secondary justify-center items-center shadow-md shadow-secondary/50 hidden md:visible">
          <HeartIcon className="w-6 h-6 text-white" />
        </span>
      </HomeSection>

      {/* Quote Section */}
      <section className="flex justify-center w-full  py-32 bg-neutral-800 text-white">
        <div className="flex flex-col max-w-2xl px-4 text-center  items-center">
          <p className="text-2xl font-serif font-bold">
            Dram Reviews makes it feel like I&#39;ve got a whisky expert right
            by my side advising me on the best whiskies to try. I love it!
          </p>
          <div className="flex items-start gap-2 mt-4">
            <Image
              src="/allan-mctofee.png"
              alt="profile"
              width={100}
              height={100}
              className="w-10 h-10 rounded-full"
            />
            <div className=" items-start text-left">
              <p className="text-md text-white">Allan McToffee</p>
              <p className="text-xs text-white/80">Whisky Enthusiast</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function ListItem({
  children,
  sign,
}: {
  children: React.ReactNode;
  sign: boolean;
}) {
  return (
    <li className="flex items-center gap-3">
      {sign ? (
        <CheckIcon className="min-w-6 min-h-6 text-success" />
      ) : (
        <Cross1Icon className="min-w-4 min-h-5 text-error" />
      )}
      <p className="text-base-content/60 text-lg">{children}</p>
    </li>
  );
}

type HomeSectionProps = {
  sectionTitle: string;
  sectionParagraph: string;
  children: React.ReactNode;
  imgPath: string;
};

function HomeSection({
  sectionTitle,
  sectionParagraph,
  children,
  imgPath,
}: HomeSectionProps) {
  return (
    <section className="flex justify-center w-full gap-10 bg-white">
      <div className="flex flex-col md:flex-row max-w-5xl px-4 py-36 gap-8  items-center">
        <div className="flex flex-col items-center md:items-start justify-center gap-2 max-w-md  md:w-1/2 px-4  text-center md:text-left order-last">
          {children}

          <h2 className="text-3xl text-base-content font-bold font-serif capitalize max-w-lg ">
            {sectionTitle}
          </h2>
          <p className="text-lg text-base-content/60">{sectionParagraph}</p>
        </div>

        <div className="flex flex-col items-left w-3/4 md:w-1/2 rounded-2xl overflow-hidden ">
          <LottiImg imgUrl={imgPath} />
        </div>
      </div>
    </section>
  );
}
