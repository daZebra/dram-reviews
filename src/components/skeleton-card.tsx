import Skeleton from "./skeleton";

export default function SkeletonCard() {
  return (
    <section className=" flex flex-col md:flex-row justify-between gap-x-20 gap-y-4 p-4 bg-base-200/30 rounded-2xl text-center md:text-left">
      <div className="flex flex-col md:flex-row gap-4">
        <div className=" justify-center  w-full md:w-36 h-44 md:h-24 ">
          <Skeleton className="h-36 w-60 md:h-24 md:w-36 rounded-xl" />
        </div>

        <div className="flex flex-col justify-center gap-y-2">
          {" "}
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-8 w-[250px]" />
          <Skeleton className="h-4 w-[100px]" />
        </div>
      </div>

      <div className="flex md:flex-col  justify-center text-center py-2  md:py-0 md:px-6 rounded-lg bg-base-200/30">
        <Skeleton className="h-8 w-8" />
      </div>
    </section>
  );
}
