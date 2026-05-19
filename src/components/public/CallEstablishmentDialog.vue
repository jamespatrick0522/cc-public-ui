<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue';
import { Mic, MicOff, Phone, PhoneCall, PhoneOff } from 'lucide-vue-next';

import { endGuestCall, getGuestCall, startGuestCall } from '@/api/calls.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { joinAgoraVoiceCall, type ActiveVoiceCall } from '@/lib/agoraVoice';
import type { GuestIdentity, VoiceCall } from '@/types/api';

const props = defineProps<{
  establishmentId: string;
  establishmentName: string;
  open: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const identity = reactive<GuestIdentity>({
  fullName: '',
  email: '',
  phone: '',
});
const call = ref<VoiceCall | null>(null);
const activeVoiceCall = ref<ActiveVoiceCall | null>(null);
const starting = ref(false);
const joining = ref(false);
const muted = ref(false);
const errorMessage = ref('');
let pollHandle: number | null = null;
let timerHandle: number | null = null;

const storageKey = computed(() => `city-connect-call-identity:${props.establishmentId}`);
const isInCall = computed(() => call.value?.status === 'accepted' && Boolean(activeVoiceCall.value));
const now = ref(Date.now());
const callDuration = computed(() => {
  if (!call.value?.acceptedAt || !isInCall.value) {
    return '00:00';
  }

  const elapsedSeconds = Math.max(
    0,
    Math.floor((now.value - new Date(call.value.acceptedAt).getTime()) / 1000),
  );
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
});
const callStateText = computed(() => {
  if (!call.value) {
    return 'Enter your details to start an in-app voice call.';
  }

  if (call.value.status === 'ringing') {
    return `Calling ${props.establishmentName}. Please wait for an answer.`;
  }

  if (call.value.status === 'accepted') {
    return activeVoiceCall.value ? 'Connected. You can speak now.' : 'Call accepted. Connecting audio...';
  }

  if (call.value.status === 'rejected') {
    return 'The establishment declined the call.';
  }

  if (call.value.status === 'missed') {
    return 'No answer. You can try again later.';
  }

  return 'Call ended.';
});

function restoreIdentity() {
  const raw = localStorage.getItem(storageKey.value);
  if (!raw) {
    return;
  }

  try {
    const parsed = JSON.parse(raw) as GuestIdentity;
    identity.fullName = parsed.fullName || '';
    identity.email = parsed.email || '';
    identity.phone = parsed.phone || '';
  } catch {
    localStorage.removeItem(storageKey.value);
  }
}

function persistIdentity() {
  localStorage.setItem(
    storageKey.value,
    JSON.stringify({
      fullName: identity.fullName.trim(),
      email: identity.email?.trim() || undefined,
      phone: identity.phone?.trim() || undefined,
    }),
  );
}

function stopPolling() {
  if (pollHandle !== null) {
    window.clearInterval(pollHandle);
    pollHandle = null;
  }
}

function startTimer() {
  stopTimer();
  now.value = Date.now();
  timerHandle = window.setInterval(() => {
    now.value = Date.now();
  }, 1000);
}

function stopTimer() {
  if (timerHandle !== null) {
    window.clearInterval(timerHandle);
    timerHandle = null;
  }
}

async function leaveVoiceAudio() {
  if (activeVoiceCall.value) {
    await activeVoiceCall.value.leave();
    activeVoiceCall.value = null;
  }

  stopTimer();
  muted.value = false;
}

async function joinIfAccepted() {
  if (!call.value || call.value.status !== 'accepted' || activeVoiceCall.value || joining.value) {
    return;
  }

  joining.value = true;

  try {
    const response = await getGuestCall(call.value.id);
    call.value = response.call;

    if (!response.agora) {
      return;
    }

    activeVoiceCall.value = await joinAgoraVoiceCall(response.agora);
    muted.value = false;
    startTimer();
  } catch (error: any) {
    errorMessage.value = error?.response?.data?.message || 'Unable to connect voice audio.';
  } finally {
    joining.value = false;
  }
}

async function refreshCall() {
  if (!call.value) {
    return;
  }

  try {
    const response = await getGuestCall(call.value.id);
    call.value = response.call;
    errorMessage.value = '';

    if (response.call.status === 'accepted') {
      await joinIfAccepted();
    }

    if (['rejected', 'missed', 'ended'].includes(response.call.status)) {
      await leaveVoiceAudio();
      stopPolling();
    }
  } catch (error: any) {
    errorMessage.value = error?.response?.data?.message || 'Unable to refresh call status.';
  }
}

function startPolling() {
  stopPolling();
  pollHandle = window.setInterval(() => {
    void refreshCall();
  }, 2000);
}

async function startCall() {
  errorMessage.value = '';

  if (!identity.fullName.trim()) {
    errorMessage.value = 'Please enter your full name.';
    return;
  }

  if (!identity.email?.trim() && !identity.phone?.trim()) {
    errorMessage.value = 'Please provide an email or phone number.';
    return;
  }

  starting.value = true;

  try {
    persistIdentity();
    const response = await startGuestCall({
      establishmentId: props.establishmentId,
      fullName: identity.fullName.trim(),
      email: identity.email?.trim() || undefined,
      phone: identity.phone?.trim() || undefined,
      clientRequestId: crypto.randomUUID(),
    });

    call.value = response.call;
    startPolling();
  } catch (error: any) {
    errorMessage.value = error?.response?.data?.message || 'Unable to start this call.';
  } finally {
    starting.value = false;
  }
}

async function toggleMute() {
  if (!activeVoiceCall.value) {
    return;
  }

  muted.value = !muted.value;
  await activeVoiceCall.value.setMuted(muted.value);
}

async function endCall() {
  stopPolling();
  await leaveVoiceAudio();

  if (call.value && ['ringing', 'accepted'].includes(call.value.status)) {
    try {
      const response = await endGuestCall(call.value.id);
      call.value = response.call;
    } catch {
      call.value = {
        ...call.value,
        status: 'ended',
        endedAt: new Date().toISOString(),
      };
    }
  }
}

async function closeDialog() {
  await endCall();
  emit('close');
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      restoreIdentity();
      errorMessage.value = '';
    } else {
      void endCall();
      call.value = null;
    }
  },
);

onBeforeUnmount(() => {
  void endCall();
});
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[1100] flex items-end justify-center bg-black/45 p-0 md:items-center md:px-4 md:py-8">
      <div class="max-h-[calc(100dvh-1rem)] w-full max-w-lg overflow-y-auto rounded-t-3xl border bg-card p-5 shadow-2xl md:max-h-[calc(100dvh-4rem)] md:rounded-3xl">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h3 class="flex items-center gap-2 text-2xl font-semibold text-foreground">
              <PhoneCall class="h-5 w-5 text-secondary" />
              Call {{ establishmentName }}
            </h3>
            <p class="mt-2 text-sm text-muted-foreground">{{ callStateText }}</p>
          </div>
          <Button variant="ghost" size="sm" @click="closeDialog">Close</Button>
        </div>

        <div v-if="!call" class="mt-5 grid gap-4">
          <div class="space-y-2">
            <Label>Full name</Label>
            <Input v-model="identity.fullName" class="h-11" placeholder="Juan Dela Cruz" />
          </div>
          <div class="space-y-2">
            <Label>Email</Label>
            <Input v-model="identity.email" type="email" class="h-11" placeholder="Optional if phone is provided" />
          </div>
          <div class="space-y-2">
            <Label>Phone</Label>
            <Input v-model="identity.phone" class="h-11" placeholder="Optional if email is provided" />
          </div>
        </div>

        <div v-else class="mt-6 rounded-2xl border bg-background p-5 text-center">
          <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary/15">
            <Phone class="h-7 w-7 text-secondary" />
          </div>
          <p class="mt-4 text-lg font-semibold text-foreground">{{ call.status.replace('_', ' ') }}</p>
          <p v-if="isInCall" class="mt-1 font-mono text-2xl font-semibold text-primary">{{ callDuration }}</p>
          <p class="mt-1 text-sm text-muted-foreground">
            Started {{ new Date(call.startedAt).toLocaleTimeString() }}
          </p>
        </div>

        <p v-if="errorMessage" class="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {{ errorMessage }}
        </p>

        <div class="mt-5 flex flex-wrap items-center justify-end gap-3">
          <Button v-if="isInCall" variant="outline" class="h-11" @click="toggleMute">
            <component :is="muted ? MicOff : Mic" class="mr-2 h-4 w-4" />
            {{ muted ? 'Unmute' : 'Mute' }}
          </Button>
          <Button v-if="call" variant="destructive" class="h-11" @click="endCall">
            <PhoneOff class="mr-2 h-4 w-4" />
            End call
          </Button>
          <Button v-else class="h-11" :disabled="starting" @click="startCall">
            <PhoneCall class="mr-2 h-4 w-4" />
            {{ starting ? 'Calling...' : 'Start call' }}
          </Button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
