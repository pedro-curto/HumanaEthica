<template>
  <v-dialog v-model="dialog" persistent width="1300">
    <v-card>
      <v-card-title>Assessment</v-card-title>
      <v-card-title>New Assessment</v-card-title>
      <v-card-text>
        <form>
          <v-text-field
            v-model="newAssessment.review"
            label="Review"
            required
            data-cy="reviewField"
          ></v-text-field>
          <v-card-actions>
        <v-form ref="form" lazy-validation>
            <v-spacer></v-spacer>
          <v-btn
              class="white--text"
              color="orange"
              @click="submit"
              data-cy="saveButton"
            >Save</v-btn>
          <v-btn
              color="blue-darken-1"
              variant="text"
              @click="$emit('close-assessment-dialog')"
          >Close</v-btn>
          </v-card-actions>
        </form>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {Vue, Component, Prop, Model} from 'vue-property-decorator';
import Assessment from '@/models/assessment/Assessment';
import Institution from '@/models/institution/Institution';
import RemoteServices from '@/services/RemoteServices';

@Component({})
export default class AssessmentDialog extends Vue {
  @Model('dialog', Boolean) dialog!: boolean;
  @Prop({ type: Number, required: true }) readonly institutionId!: number;
  newAssessment: Assessment = new Assessment();

  async created() {
    // this.newAssessment.institutionId = this.institutionId; // TODO insert when created in assessment model
  }

  submit() {
    this.$emit('onSubmit', this.newAssessment.review);
  }

}
</script>
<style scoped lang="scss"></style>