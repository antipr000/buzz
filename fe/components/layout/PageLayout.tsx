import React from 'react';
import { View, ScrollView, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import BackButton from './BackButton';

interface PageLayoutProps {
  title: string;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
  showBackButton?: boolean;
  scrollEnabled?: boolean;
  contentContainerStyle?: ViewStyle;
  className?: string;
  headerClassName?: string;
  scrollClassName?: string;
}

const PageLayout = ({
  title,
  children,
  headerRight,
  showBackButton = true,
  scrollEnabled = true,
  contentContainerStyle,
  className = '',
  headerClassName = '',
  scrollClassName = '',
}: PageLayoutProps) => {
  return (
    <SafeAreaView edges={['top']} className={`flex-1 bg-white ${className}`}>
      {/* Header */}
      <View className={`flex-row items-center justify-between px-5 py-5 pb-4 bg-white border-b border-[rgba(0,0,0,0.05)] ${headerClassName}`}>
        <View className='flex-row items-center gap-4'>
          {showBackButton && <BackButton />}
          <Text className='font-semibold text-xs text-secondary'>{title}</Text>
        </View>
        {headerRight && <View>{headerRight}</View>}
      </View>

      {/* Content Area */}
      {scrollEnabled ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          className={`flex-1 bg-background ${scrollClassName}`}
          contentContainerStyle={contentContainerStyle}
        >
          {children}
        </ScrollView>
      ) : (
        <View className={`flex-1 bg-background ${scrollClassName}`} style={contentContainerStyle}>
          {children}
        </View>
      )}
    </SafeAreaView>
  );
};

export default PageLayout;
