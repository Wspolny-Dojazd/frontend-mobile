import { View, Text, Pressable } from "react-native";
import { MoonStar } from "~/lib/icons/MoonStar";
import { useColorScheme } from "~/lib/useColorScheme";
import { Sun } from "~/lib/icons/Sun";


export const ThemeToggle = () => {
    const { colorScheme, toggleColorScheme } = useColorScheme();

    return (
        <Pressable
        className="p-4 border border-gray-300 rounded-md dark:border-white"
        onPress={toggleColorScheme}>
            {colorScheme === 'dark' ? <MoonStar className="text-white" /> : <Sun className=" text-black" />}
        </Pressable>
    )
}