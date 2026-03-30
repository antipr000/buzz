import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { ArrowLeft, ImageIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import {
    EVENT_CATEGORY_ICONS,
    EVENT_CATEGORY_LABELS,
    type EventCategoryLabel,
} from '@/constants/eventCategories';

const CATEGORIES: EventCategoryLabel[] = [...EVENT_CATEGORY_LABELS];

export default function CreateEventScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const pickImage = async () => {
        try {
            //legacy support
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (permissionResult.granted === false) {
                alert("You've refused to allow this app to access your photos!");
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                quality: 1,
            });

            console.log("ImagePicker Result:", JSON.stringify(result, null, 2));

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setCoverImage(result.assets[0].uri);
            } else {
                console.log("Image selection was canceled or no assets returned.");
            }
        } catch (error) {
            console.error("Error picking image:", error);
        }
    };

    return (
        <View className="flex-1 bg-surface">
            {/* Header */}
            <View
                className="pb-4 px-4 bg-secondary flex-row items-center gap-4"
                style={{ paddingTop: Math.max(insets.top, 40) }}
            >
                <TouchableOpacity onPress={() => router.back()} className="p-1">
                    <ArrowLeft size={24} color="rgba(249, 250, 251, 1)" />
                </TouchableOpacity>
                <Text className="text-xl font-semibold text-[#F97316]">Create Event</Text>
            </View>

            <ScrollView
                contentContainerClassName="p-5 pb-10 gap-5"
                showsVerticalScrollIndicator={false}
                automaticallyAdjustKeyboardInsets={true}
            >
                {/* Event Cover */}
                <View className="gap-1">
                    <Text className="font-medium text-foreground text-xs">Event Cover</Text>
                    <TouchableOpacity
                        onPress={pickImage}
                        activeOpacity={0.8}
                        className="h-48 w-full rounded-2xl border-2 border-dashed border-primary/20 bg-[rgba(240,239,255,1)] items-center justify-center overflow-hidden"
                    >
                        {coverImage ? (
                            <Image
                                source={{ uri: coverImage }}
                                style={{ width: '100%', height: '100%', borderRadius: 16 }}
                                contentFit="cover"
                            />
                        ) : (
                            <View className="items-center gap-2">
                                <ImageIcon size={18} color="rgba(79, 70, 229, 0.5)" />
                                <Text className="text-[rgba(15,23,42,0.7)] text-xs">Tap to upload cover image</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Event Title */}
                <View className="gap-1">
                    <Text className="font-medium text-foreground text-xs">Event Title</Text>
                    <Input
                        placeholder="Give your event a catchy name"
                        className="border-0 placeholder:text-xs bg-[rgba(240,239,255,1)]"
                    />
                </View>

                {/* Description */}
                <View className="gap-1">
                    <Text className="font-medium text-foreground text-xs">Description</Text>
                    <Textarea
                        placeholder="Tell people what your event is all about..."
                        className="min-h-[85px] text-xs border-0 bg-[rgba(240,239,255,1)]"
                    />
                </View>

                {/* Event Category */}
                <View className="gap-1">
                    <Text className="font-medium text-foreground text-xs">Event Category</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerClassName="flex-row flex-nowrap items-center gap-2.5"
                    >
                        {CATEGORIES.map((category) => {
                            const isSelected = selectedCategory === category;
                            const asset = EVENT_CATEGORY_ICONS[category];

                            return (
                                <TouchableOpacity
                                    key={category}
                                    onPress={() => setSelectedCategory(category)}
                                    className={`shrink-0 flex-row items-center gap-1.5 rounded-full border border-primary px-4 py-2 ${isSelected ? 'bg-primary' : 'bg-transparent'
                                        }`}
                                >
                                    <View className="size-4 shrink-0 items-center justify-center">
                                        <Image
                                            source={asset}
                                            style={{ width: 16, height: 16 }}
                                            contentFit="contain"
                                        />
                                    </View>
                                    <Text className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-primary'}`}>
                                        {category}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Date & Time Row */}
                <View className="flex-row gap-4">
                    <View className="flex-1 gap-1">
                        <Text className="font-semibold text-foreground text-sm">Date</Text>
                        <View className="relative justify-center">
                            <View className="absolute left-3 z-10 pointer-events-none">
                                <Image
                                    source={require('@/assets/images/create/calender.svg')}
                                    style={{ width: 12, height: 12 }}
                                    contentFit="contain"
                                />
                            </View>
                            <Input
                                placeholder="dd-mm-yyyy"
                                className="pl-9 border-0 text-xs bg-[rgba(240,239,255,1)]"
                            />
                        </View>
                    </View>
                    <View className="flex-1 gap-1">
                        <Text className="font-semibold text-foreground text-sm">Time</Text>
                        <View className="relative justify-center">
                            <View className="absolute left-3 z-10 pointer-events-none">
                                <Image
                                    source={require('@/assets/images/create/clock.svg')}
                                    style={{ width: 12, height: 12 }}
                                    contentFit="contain"
                                />
                            </View>
                            <Input
                                placeholder="hh-mm"
                                className="pl-9 border-0 text-xs bg-[rgba(240,239,255,1)]"
                            />
                        </View>
                    </View>
                </View>

                {/* Location */}
                <View className="gap-1">
                    <Text className="font-semibold text-foreground text-sm">Location</Text>
                    <View className="relative justify-center">
                        <View className="absolute left-3 z-10 pointer-events-none">
                            <Image
                                source={require('@/assets/images/create/location.svg')}
                                style={{ width: 12, height: 12 }}
                                contentFit="contain"
                            />
                        </View>
                        <Input
                            placeholder="Where is your amazing event taking place?"
                            className="pl-9 border-0 bg-[rgba(240,239,255,1)] text-xs"
                        />
                    </View>
                </View>

                {/* Ticket Price */}
                <View className="gap-1">
                    <Text className="font-medium text-foreground text-xs">Ticket Price</Text>
                    <View className="relative justify-center">
                        <View className="absolute left-3 z-10 pointer-events-none">
                            <Image
                                source={require('@/assets/images/create/cash.svg')}
                                style={{ width: 12, height: 12 }}
                                contentFit="contain"
                            />
                        </View>
                        <Input
                            placeholder="Keep it 0 for free events"
                            className="pl-9 border-0 bg-[rgba(240,239,255,1)] text-xs"
                            keyboardType="numeric"
                        />
                    </View>
                </View>
                {/* Footer Button */}
                <View className="p-4  items-center">
                    <Button
                        className="bg-primary px-10  rounded-xl"
                        onPress={() => router.push('/event-created')}
                    >
                        <Text className="text-white text-sm font-bold ">Create Event</Text>
                    </Button>
                </View>
            </ScrollView>
        </View>
    );
}
