import { Input } from "@heroui/react";
import { useSearchBox } from "react-instantsearch";

const NextUiSearch = (props) => {
  const { refine } = useSearchBox(props);

  return (
    <div className="flex justify-center p-4 ">
      <Input
        isClearable
        classNames={{
          base: "max-w-full sm:max-w-full md:max-w-full lg:max-w-full h-full",
          mainWrapper: "h-full",
          input: [
            "text-lg",
            "bg-transparent",
            "text-black/90 dark:text-white/90",
            "placeholder:text-default-300/60 dark:placeholder:text-white/60",
          ],
          innerWrapper: "bg-transparent",
          inputWrapper: "h-full font-normal text-default-500 bg-zinc-600 hover:bg-lime-600 dark:bg-zinc-800 dark:text-white/80",
        }}
        variant="bordered"
        radius={"full"}
        placeholder="Search Projects by Names..."
        size="lg"
        startContent={<img src="/searchIcon.svg" alt="search" className="pointer-events-none flex-shrink-0" />}
        className="w-1/2"
        value={props.currentRefinement}
        onValueChange={(value) => refine(value)}
      />
    </div>
  );
};

export default NextUiSearch;