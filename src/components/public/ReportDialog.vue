<script setup lang="ts">
import { reactive, ref } from 'vue';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { ReportPayload } from '@/types/api';

const props = defineProps<{
  establishmentId: string;
  open: boolean;
}>();

const emit = defineEmits<{
  close: [];
  submit: [payload: ReportPayload];
}>();

const form = reactive({
  reason: '',
  details: '',
});
const errorMessage = ref('');

function submitForm() {
  errorMessage.value = '';

  if (!form.reason.trim()) {
    errorMessage.value = 'Please enter a reason for your report.';
    return;
  }

  emit('submit', {
    establishmentId: props.establishmentId,
    reason: form.reason.trim(),
    details: form.details.trim() || undefined,
  });

  form.reason = '';
  form.details = '';
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
    <div class="w-full max-w-lg rounded-3xl border bg-card p-6 shadow-2xl">
      <div class="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 class="text-2xl font-semibold text-foreground">Submit report</h3>
          <p class="mt-1 text-sm text-muted-foreground">Use this if the listing appears misleading, fake, or inappropriate.</p>
        </div>
        <Button variant="ghost" size="sm" @click="emit('close')">Close</Button>
      </div>

      <div class="space-y-4">
        <div class="space-y-2">
          <Label>Reason</Label>
          <Input v-model="form.reason" class="h-11" placeholder="Example: Wrong details / fake listing" />
        </div>
        <div class="space-y-2">
          <Label>Details</Label>
          <Textarea v-model="form.details" class="min-h-[120px]" placeholder="Share more context if needed." />
        </div>
      </div>

      <p v-if="errorMessage" class="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{{ errorMessage }}</p>

      <div class="mt-5 flex gap-3">
        <Button variant="outline" class="h-11 flex-1" @click="emit('close')">Cancel</Button>
        <Button class="h-11 flex-1" @click="submitForm">Send report</Button>
      </div>
    </div>
  </div>
</template>
