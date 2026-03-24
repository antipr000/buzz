import { TouchableOpacity, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { Text } from '@/components/ui/text'
import { ChevronDown, ChevronUp } from 'lucide-react-native'
import HelpContact from '@/components/HelpContact'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import PageLayout from '@/components/PageLayout'

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
        <PageLayout title={title} scrollEnabled={false} contentContainerStyle={{ padding: 0 }}>
            {/* Content Area */}
            <ScrollView showsVerticalScrollIndicator={false} className='flex-1 bg-background' contentContainerStyle={{ padding: 16 }}>
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

        </PageLayout>
    )
}

export default HelpPageTemplate
