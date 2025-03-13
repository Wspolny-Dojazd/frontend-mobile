import { Text, View } from 'react-native';

export const EditScreenInfo = ({ path }: { path: string }) => {
  const title = 'Open up the code for this screen:';
  const description =
    'Change any of the text, save the file, and your app will automatically update.';

  return (
    <View>
      <View className={styles.getStartedContainer}>
        <Text className={styles.getStartedText}>{title}</Text>
        <View className={styles.codeHighlightContainer + styles.homeScreenFilename}>
          <Text className="dark:text-white">{path}</Text>
        </View>
        <Text className={styles.getStartedText}>{description}</Text>
      </View>
    </View>
  );
};

const styles = {
  codeHighlightContainer: `rounded-md px-1 dark:text-white`,
  getStartedContainer: `items-center mx-12`,
  getStartedText: `text-lg leading-6 text-center dark:text-white`,
  helpContainer: `items-center mx-5 mt-4`,
  helpLink: `py-4 dark:text-white`,
  helpLinkText: `text-center dark:text-white`,
  homeScreenFilename: `my-2 dark:text-white`,
};
