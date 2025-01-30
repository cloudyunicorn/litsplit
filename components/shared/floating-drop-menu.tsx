import { ChevronDownIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";


const FloatingDropdownMenu = () => {
  return (
    <div className="relative h-screen">
      {/* Floating Round Dropdown Menu on the Top-Right */}
      <DropdownMenu>
        <DropdownMenuTrigger>
          <button
            className="absolute top-4 right-4 w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg hover:bg-blue-600 focus:outline-none"
            aria-label="Open menu"
          >
            <ChevronDownIcon className="w-5 h-5" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-48 bg-white shadow-lg rounded-lg mt-2 p-2">
          <DropdownMenuItem>
            Item 1
          </DropdownMenuItem>
          <DropdownMenuItem>
            Item 2
          </DropdownMenuItem>
          <DropdownMenuItem>
            Item 3
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default FloatingDropdownMenu;