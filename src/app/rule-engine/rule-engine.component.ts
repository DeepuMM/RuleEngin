import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormArray, Validators, FormGroup, AbstractControl, FormControl } from '@angular/forms';

export interface Entity {
  name?:string;
  type?: string;
  element: Entity[];
}

export const data: Entity = {
  'element': [
    {
      'type': '','name':'',
      'element': []
    }
  ]
}

export const subData: Entity = {
  'type': '',
  'name':'',
  'element': [
  ]
}

@Component({
  selector: 'app-rule-engine',
  templateUrl: './rule-engine.component.html',
  styleUrls: ['./rule-engine.component.scss']
})
export class RuleEngineComponent implements OnInit {
  ruleEngineForm: FormGroup;
  entityTypes = ["Number", "String", "Boolean", "Object"];

  constructor(private formBuilder: FormBuilder) {
  }

  buildForm(item: Entity) {
    const group: { [id: string]: AbstractControl } = {};
    if (item.hasOwnProperty('type')) {
      group.type = new FormControl(item.type);
    }
    if (item.hasOwnProperty('name')) {
      group.name = new FormControl(item.name);
    }

    if (item.element) {
      group.element = this.formBuilder.array(item.element.map(el => this.buildForm(el)))
    }

    return this.formBuilder.group(group);
  }

  ngOnInit() {
    this.ruleEngineForm = this.buildForm(data);
  }

  onSubmit() {
    console.log(this.ruleEngineForm.value);
  }

  addElement(prefix) {
    let controls = <FormArray>this.ruleEngineForm.get(prefix.slice(0, -1));
    controls.push(this.buildForm(subData));
  }

  changeType($event, prefix) {
    let control = <FormArray>this.ruleEngineForm.get(prefix+".element");
    if ($event.target.value == "Object") {
      control.push(this.buildForm(subData));
    }else{
      control.clear();
    }
  }
  deleteElement(prefix,i){
    let control = <FormArray>this.ruleEngineForm.get(prefix.slice(0, -1));
    control.removeAt(i);
  }

  copyToClipboard() {
    const jsonString = JSON.stringify(this.ruleEngineForm.value, null, 2);
    navigator.clipboard.writeText(jsonString).then(() => {
      alert('JSON copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  }

  loadFromJson() {
    const jsonInput = prompt('Paste your JSON rule here:');
    if (jsonInput) {
      try {
        const parsedData = JSON.parse(jsonInput);
        this.ruleEngineForm = this.buildForm(parsedData);
      } catch (e) {
        alert('Invalid JSON format. Please check your input.');
      }
    }
  }

}
