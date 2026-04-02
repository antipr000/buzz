import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Image } from 'expo-image';
import { router, Link } from 'expo-router';
import { ChevronRight, MoreVertical } from 'lucide-react-native';
import PageLayout from '@/components/layout/PageLayout';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDisplayDate } from '@/app/(main)/create-event/payload';
import { useAddresses, useDeleteAddress, usePatchProfile, useProfileMe } from '@/hooks/api';
import type { AddressOut } from '@/services/types/address';
import type { MaritalStatus, ProfileIdentify } from '@/services/types/profile';
import {
  buildJoinedFullName,
  buildProfilePatch,
  parseBirthdayDate,
  splitFullName,
} from '@/app/(main)/profile/editPayload';

const IDENTIFY_OPTIONS: ProfileIdentify[] = ['Man', 'Woman', 'Other'];
const MARITAL_OPTIONS: MaritalStatus[] = ['Single', 'Married'];

function savedAddressSummary(row: AddressOut): string {
  return `${row.address_type} · ${row.city} · ${row.pin_code}`;
}

const DELETE_ADDRESS_DIALOG_SURFACE =
  'w-[80vw] self-center gap-5 rounded-xl border border-[rgba(0,0,0,0.08)] bg-white p-6 shadow-lg shadow-black/10';

function ProfileBirthdayRow(props: {
  birthdayCleared: boolean;
  birthdayDate: Date;
  onPick: (d: Date) => void;
  onClear: () => void;
}) {
  const { birthdayCleared, birthdayDate, onPick, onClear } = props;
  const [show, setShow] = useState(false);

  const onChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
      if (event.type === 'set' && selected) onPick(selected);
      return;
    }
    if (selected) onPick(selected);
  };

  const iosModal = show ? (
    <Modal visible transparent animationType="slide" onRequestClose={() => setShow(false)}>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={() => setShow(false)}>
        <Pressable
          className="rounded-t-2xl bg-background pb-6 pt-2"
          onPress={(e) => e.stopPropagation()}
        >
          <DateTimePicker
            value={birthdayDate}
            mode="date"
            display="spinner"
            onChange={onChange}
          />
          <Pressable
            onPress={() => setShow(false)}
            className="mx-4 mt-2 items-center rounded-xl bg-primary py-3"
          >
            <Text className="text-sm font-semibold text-white">Done</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  ) : null;

  return (
    <View className="mb-4">
      <View className="mb-1.5 flex-row items-center justify-between">
        <Text className="text-[12px] font-semibold text-secondary-foreground">
          Birthday (Optional)
        </Text>
        {!birthdayCleared ? (
          <TouchableOpacity onPress={onClear} activeOpacity={0.7}>
            <Text className="text-[11px] font-medium text-[rgba(255,38,18,1)]">Clear</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setShow(true)}
        className="h-9 justify-center rounded-md border border-[rgba(0,0,0,0.1)] px-3"
      >
        <Text className="font-poppins text-[11px] text-[#334155]">
          {birthdayCleared ? 'Not set' : formatDisplayDate(birthdayDate)}
        </Text>
      </TouchableOpacity>
      {Platform.OS === 'android' && show ? (
        <DateTimePicker
          value={birthdayDate}
          mode="date"
          display="default"
          onChange={onChange}
        />
      ) : null}
      {Platform.OS === 'ios' ? iosModal : null}
    </View>
  );
}

const EditProfile = () => {
  const insets = useSafeAreaInsets();
  const { data, isPending, isError, refetch, isFetching } = useProfileMe();
  const patchMutation = usePatchProfile();
  const {
    data: savedAddresses,
    isPending: addressesPending,
    isError: addressesError,
    refetch: refetchAddresses,
    isFetching: addressesFetching,
  } = useAddresses();
  const deleteAddressMutation = useDeleteAddress();

  const initialRef = useRef<typeof data>(null);
  const [formReady, setFormReady] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [birthdayDate, setBirthdayDate] = useState(() => new Date(2000, 0, 1, 12, 0, 0, 0));
  const [birthdayCleared, setBirthdayCleared] = useState(true);
  const [identifyType, setIdentifyType] = useState<ProfileIdentify | null>(null);
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus | null>(null);
  const [deleteAddressTarget, setDeleteAddressTarget] = useState<AddressOut | null>(null);

  useEffect(() => {
    if (!data || initialRef.current) return;
    initialRef.current = data;
    const { first, last } = splitFullName(data.full_name);
    setFirstName(first);
    setLastName(last);
    setMobileNumber(data.mobile_number ?? '');
    if (data.birthday) {
      setBirthdayDate(parseBirthdayDate(data.birthday));
      setBirthdayCleared(false);
    } else {
      setBirthdayDate(new Date(2000, 0, 1, 12, 0, 0, 0));
      setBirthdayCleared(true);
    }
    setIdentifyType(data.identify);
    setMaritalStatus(data.marital_status);
    setFormReady(true);
  }, [data]);

  const onSave = async () => {
    const initial = initialRef.current;
    if (!initial) return;

    const fullJoined = buildJoinedFullName(firstName, lastName);
    if (!fullJoined.trim()) {
      Alert.alert('Name required', 'Please enter at least a first or last name.');
      return;
    }

    const patch = buildProfilePatch(initial, {
      firstName,
      lastName,
      birthdayCleared,
      birthdayDate,
      identify: identifyType,
      maritalStatus,
      mobileNumber,
    });

    if (Object.keys(patch).length === 0) {
      router.back();
      return;
    }

    try {
      await patchMutation.mutateAsync(patch);
      router.back();
    } catch {
      Alert.alert('Could not save', 'Please try again.');
    }
  };

  const toggleIdentify = (type: ProfileIdentify) => {
    setIdentifyType((prev) => (prev === type ? null : type));
  };

  const toggleMarital = (type: MaritalStatus) => {
    setMaritalStatus((prev) => (prev === type ? null : type));
  };

  const onEditAddress = (id: string) => {
    router.push({ pathname: '/profile/address', params: { addressId: id } });
  };

  if (data ? !formReady : isPending) {
    return (
      <PageLayout title="Edit Profile" scrollEnabled={false}>
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator className="text-primary" />
        </View>
      </PageLayout>
    );
  }

  if (isError && !data) {
    return (
      <PageLayout title="Edit Profile" scrollEnabled={false}>
        <View className="flex-1 items-center justify-center gap-4 px-8 py-20">
          <Text className="text-center text-sm text-secondary-foreground">
            Could not load your profile.
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className="rounded-full border border-primary px-8 py-2.5"
            disabled={isFetching}
          >
            <Text className="text-sm font-semibold text-primary">Retry</Text>
          </TouchableOpacity>
        </View>
      </PageLayout>
    );
  }

  if (!data) {
    return null;
  }

  const avatarUri = data.profile_image?.trim();

  return (
    <>
    <PageLayout title="Edit Profile" scrollEnabled={false} contentContainerStyle={{ padding: 0 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
      >
        <View className="relative h-[117px] items-center justify-center overflow-hidden bg-primary">
          {avatarUri ? (
            <Image
              source={{ uri: avatarUri }}
              style={[StyleSheet.absoluteFillObject, { opacity: 0.35 }]}
              contentFit="cover"
            />
          ) : (
            <Image
              source={require('@/assets/images/edit/image.jpg')}
              style={[StyleSheet.absoluteFillObject, { opacity: 0.3 }]}
              contentFit="cover"
              contentPosition={{ top: -170, left: 30 }}
            />
          )}
          <TouchableOpacity activeOpacity={0.8} className="items-center">
            <Image
              source={require('@/assets/images/edit/user.svg')}
              style={{ width: 40, height: 40, marginBottom: 4 }}
              contentFit="contain"
            />
            <Text className="text-[12px] font-medium text-white">Photo</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-white p-4 pt-5">
          <View className="mb-4">
            <Text className="mb-1.5 text-[12px] font-semibold text-secondary-foreground">
              Mobile Number
            </Text>
            <Input
              value={mobileNumber}
              onChangeText={setMobileNumber}
              placeholder="Phone number"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              className="h-9 rounded-md border border-[rgba(0,0,0,0.1)] px-3 py-0 font-poppins text-[11px] text-[#334155] shadow-none focus-visible:ring-0"
            />
          </View>

          <View className="mb-6">
            <Text className="mb-1.5 text-[12px] font-semibold text-secondary-foreground">
              Email
            </Text>
            <View className="h-9 flex-row items-center rounded-md border border-[rgba(0,0,0,0.1)] px-3">
              <Input
                value={data.email}
                editable={false}
                className="flex-1 border-0 bg-transparent p-0 py-0 font-poppins text-[11px] text-[#64748B] shadow-none"
                style={{ borderWidth: 0 }}
              />
            </View>
            <Text className="mt-1 text-[10px] text-[#94A3B8]">
              Email cannot be changed here.
            </Text>
          </View>

          <View className="-mx-4 mb-3 h-[1px] flex-1 bg-[rgba(0,0,0,0.05)]" />

          <Text className="mb-3 text-[13px] font-semibold text-secondary-foreground">
            Personal Details
          </Text>

          <View className="mb-4">
            <Text className="mb-1.5 text-xs font-semibold text-secondary-foreground">
              First name
            </Text>
            <Input
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First name"
              placeholderTextColor="#94A3B8"
              className="h-9 rounded-md border border-[rgba(0,0,0,0.1)] px-3 py-0 font-poppins text-[11px] text-[#334155] shadow-none focus-visible:ring-0"
            />
          </View>

          <View className="mb-4">
            <Text className="mb-1.5 text-[12px] font-semibold text-secondary-foreground">
              Last name
            </Text>
            <Input
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last name"
              placeholderTextColor="#94A3B8"
              className="h-9 rounded-md border border-[rgba(0,0,0,0.1)] px-3 py-0 font-poppins text-[11px] text-[#334155] shadow-none focus-visible:ring-0"
            />
          </View>

          <ProfileBirthdayRow
            birthdayCleared={birthdayCleared}
            birthdayDate={birthdayDate}
            onPick={(d) => {
              setBirthdayDate(d);
              setBirthdayCleared(false);
            }}
            onClear={() => {
              setBirthdayCleared(true);
            }}
          />

          <View className="mb-4">
            <Text className="mb-2 text-[12px] font-semibold text-secondary-foreground">
              Identify (Optional)
            </Text>
            <View className="flex-row gap-2">
              {IDENTIFY_OPTIONS.map((type) => (
                <TouchableOpacity
                  key={type}
                  activeOpacity={0.7}
                  onPress={() => toggleIdentify(type)}
                  className={`rounded-md border px-3.5 py-1 ${
                    identifyType === type
                      ? 'border-[rgba(0,0,0,0.5)] bg-[rgba(0,0,0,0.05)]'
                      : 'border-[rgba(0,0,0,0.2)]'
                  }`}
                >
                  <Text
                    className={`text-[11px] ${identifyType === type ? 'font-medium text-[#334155]' : 'text-[#64748B]'}`}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="mb-5">
            <Text className="mb-2 text-[12px] font-semibold text-secondary-foreground">
              Marital status (Optional)
            </Text>
            <View className="flex-row gap-2">
              {MARITAL_OPTIONS.map((type) => (
                <TouchableOpacity
                  key={type}
                  activeOpacity={0.7}
                  onPress={() => toggleMarital(type)}
                  className={`rounded-md border px-3.5 py-1 ${
                    maritalStatus === type
                      ? 'border-[rgba(0,0,0,0.5)] bg-[rgba(0,0,0,0.05)]'
                      : 'border-[rgba(0,0,0,0.2)]'
                  }`}
                >
                  <Text
                    className={`text-[11px] ${maritalStatus === type ? 'font-medium text-[#334155]' : 'text-[#64748B]'}`}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="mb-4">
            <Text className="mb-2 text-[12px] font-semibold text-secondary-foreground">
              Your saved addresses
            </Text>
            {addressesPending ? (
              <View className="mb-3 items-center py-3">
                <ActivityIndicator size="small" color="#64748B" />
              </View>
            ) : addressesError ? (
              <View className="mb-3 gap-2">
                <Text className="text-[11px] text-[#64748B]">
                  Could not load addresses. Try again in a moment.
                </Text>
                <TouchableOpacity
                  onPress={() => void refetchAddresses()}
                  disabled={addressesFetching}
                  className="self-start rounded-md border border-[rgba(0,0,0,0.15)] px-3 py-1.5 active:bg-[rgba(0,0,0,0.04)]"
                >
                  <Text className="text-[11px] font-medium text-[#334155]">
                    {addressesFetching ? 'Retrying…' : 'Retry'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : savedAddresses && savedAddresses.length > 0 ? (
              <View className="mb-3 gap-2">
                {savedAddresses.map((addr) => (
                  <View
                    key={addr.id}
                    className="flex-row items-center rounded-md border border-[rgba(0,0,0,0.1)] pl-3 pr-1 py-2"
                  >
                    <View className="min-w-0 flex-1 pr-2">
                      <Text
                        className="text-[11px] text-secondary-foreground"
                        numberOfLines={2}
                      >
                        {savedAddressSummary(addr)}
                      </Text>
                      {addr.address_line1 ? (
                        <Text className="mt-0.5 text-[10px] text-[#64748B]" numberOfLines={1}>
                          {addr.address_line1}
                        </Text>
                      ) : null}
                    </View>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Pressable
                          hitSlop={8}
                          className="h-9 w-9 items-center justify-center rounded-md active:bg-[rgba(0,0,0,0.06)]"
                          accessibilityLabel="Address actions"
                        >
                          <MoreVertical size={18} color="#334155" />
                        </Pressable>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onPress={() => onEditAddress(addr.id)}>
                          <Text className="text-sm text-popover-foreground">Edit</Text>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onPress={() => setDeleteAddressTarget(addr)}
                          disabled={deleteAddressMutation.isPending}
                        >
                          <Text className="text-sm text-destructive">Delete</Text>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </View>
                ))}
              </View>
            ) : null}
            <Link href="/profile/address" asChild>
              <TouchableOpacity
                activeOpacity={0.7}
                className="h-9 flex-row items-center justify-between rounded-md border border-[rgba(0,0,0,0.1)] px-3"
              >
                <Text className="text-[11px] text-secondary-foreground">Add new address</Text>
                <ChevronRight size={14} color="#0F172A" />
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 border-t border-[rgba(0,0,0,0.05)] bg-white px-4 py-3"
        style={{ paddingBottom: Math.max(insets.bottom, 12) }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onSave}
          disabled={patchMutation.isPending}
          className={`h-[42px] w-full items-center justify-center rounded-lg bg-primary ${patchMutation.isPending ? 'opacity-60' : ''}`}
        >
          {patchMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-[13px] font-semibold text-white">Save changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </PageLayout>

    <AlertDialog
      open={deleteAddressTarget !== null}
      onOpenChange={(open) => {
        if (!open) setDeleteAddressTarget(null);
      }}
    >
      {deleteAddressTarget ? (
        <AlertDialogContent className={DELETE_ADDRESS_DIALOG_SURFACE}>
          <AlertDialogHeader className="items-center gap-1">
            <Text className="text-center text-[13px] font-semibold text-[#0F172A]">
              Delete address?
            </Text>
            <Text
              className="text-center text-[11px] leading-[16px] text-[rgba(15,23,42,0.65)]"
              numberOfLines={3}
            >
              {savedAddressSummary(deleteAddressTarget)}
              {deleteAddressTarget.address_line1
                ? `\n${deleteAddressTarget.address_line1}`
                : ''}
            </Text>
          </AlertDialogHeader>
          <View className="w-full flex-col items-center gap-2 px-2">
            <AlertDialogCancel
              className='w-full'
              disabled={deleteAddressMutation.isPending}
            >
              <Text className="text-center text-[12px] font-medium text-[#334155]">Cancel</Text>
            </AlertDialogCancel>
            <AlertDialogAction
              className={
               "bg-red-500 w-full"
              }
              disabled={deleteAddressMutation.isPending}
              onPress={() => {
                const row = deleteAddressTarget;
                if (!row) return;
                void (async () => {
                  try {
                    await deleteAddressMutation.mutateAsync(row.id);
                    setDeleteAddressTarget(null);
                  } catch {
                    Alert.alert('Could not delete', 'Please try again.');
                  }
                })();
              }}
            >
              <Text className="text-center text-[12px] font-semibold text-white">
                {deleteAddressMutation.isPending ? 'Deleting…' : 'Delete'}
              </Text>
            </AlertDialogAction>
          </View>
        </AlertDialogContent>
      ) : null}
    </AlertDialog>
    </>
  );
};

export default EditProfile;
