import { cn } from "@/lib/utils";
import Image from "next/image";

type ProfilePictureProps = {
  urls: string[];
  imgClass?: string;
  divClass?: string;
};

export default function ProfilePictures({
  urls,
  imgClass,
  divClass,
}: ProfilePictureProps) {
  return (
    <div className={cn("flex ", divClass)}>
      {urls.map((url) => (
        <Image
          key={url}
          src={url}
          alt="thumbnail"
          className={cn(
            "w-8 h-8 rounded-full border border-base-100 -ml-2 object-cover",
            imgClass
          )}
          width={48}
          height={48}
          //   style={{ objectFit: "fill" }}
        />
      ))}
    </div>
  );
}
