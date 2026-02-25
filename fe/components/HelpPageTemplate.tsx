import { View, TouchableOpacity, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useState } from 'react'
import { Text } from '@/components/ui/text'
import { ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react-native'
import { router } from 'expo-router'
import HelpContact from '@/components/HelpContact'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'

interface FaqItem {
    question: string;
    element: React.ReactNode;
}

interface HelpPageTemplateProps {
    title: string;
    faqs: FaqItem[];
}

const HelpPageTemplate = ({ title, faqs }: HelpPageTemplateProps) => {
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    return (
        <SafeAreaView edges={['top']} className='flex-1 border-0'>
            {/* Header */}
            <View className='flex-row items-center px-5 py-6 pb-4 bg-white border-b border-[rgba(0,0,0,0.05)]'>
                <TouchableOpacity onPress={() => router.back()} className='mr-4'>
                    <ChevronLeft size={16} color="rgba(29, 27, 32, 1)" />
                </TouchableOpacity>
                <Text className='font-bold text-xs text-secondary-foreground'>{title}</Text>
            </View>

            {/* Content Area */}
            <ScrollView showsVerticalScrollIndicator={false} className='flex-1 bg-[rgba(244,246,251,1)]' contentContainerStyle={{ padding: 16 }}>
                {faqs.map((faq, index) => (
                    <Collapsible
                        key={index}
                        open={openIndex === index}
                        onOpenChange={(isOpen) => setOpenIndex(isOpen ? index : null)}
                        className='mb-3 bg-white rounded-md overflow-hidden shadow-sm shadow-black/5 border border-[rgba(0,0,0,0.05)]'
                    >
                        <CollapsibleTrigger asChild>
                            <TouchableOpacity activeOpacity={0.7} className='flex-row justify-between items-center p-4 bg-white'>
                                <Text className='text-secondary-foreground text-xs flex-1 '>{faq.question}</Text>
                                {openIndex === index ? (
                                    <ChevronUp size={15} color="rgba(29, 27, 32, 1)" />
                                ) : (
                                    <ChevronDown size={15} color="rgba(29, 27, 32, 1)" />
                                )}
                            </TouchableOpacity>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            {faq.element}
                        </CollapsibleContent>
                    </Collapsible>
                ))}
            </ScrollView>

            {/* Bottom Contact Section */}
            <HelpContact />

        </SafeAreaView>
    )
}

export default HelpPageTemplate
