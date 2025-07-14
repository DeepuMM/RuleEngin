import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder, FormArray } from '@angular/forms';

import { RuleEngineComponent, data, subData } from './rule-engine.component';

describe('RuleEngineComponent', () => {
  let component: RuleEngineComponent;
  let fixture: ComponentFixture<RuleEngineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RuleEngineComponent ],
      imports: [ ReactiveFormsModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RuleEngineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default entity types', () => {
    expect(component.entityTypes).toEqual(["Number", "String", "Boolean", "Object"]);
  });

  it('should initialize form with default data on ngOnInit', () => {
    expect(component.ruleEngineForm).toBeDefined();
    expect(component.ruleEngineForm.get('element')).toBeDefined();
    expect(component.ruleEngineForm.get('element') instanceof FormArray).toBe(true);
  });

  describe('Data constants', () => {
    it('should have default data structure', () => {
      expect(data).toBeDefined();
      expect(data.element).toBeDefined();
      expect(data.element.length).toBe(1);
      expect(data.element[0]).toEqual({
        type: '',
        name: '',
        element: []
      });
    });

    it('should have default subData structure', () => {
      expect(subData).toBeDefined();
      expect(subData.type).toBe('');
      expect(subData.name).toBe('');
      expect(subData.element).toEqual([]);
    });
  });

  describe('buildForm method', () => {
    it('should build form with type and name controls', () => {
      const testEntity = { type: 'String', name: 'testName', element: [] };
      const form = component.buildForm(testEntity);
      
      expect(form.get('type')).toBeDefined();
      expect(form.get('name')).toBeDefined();
      expect(form.get('element')).toBeDefined();
      expect(form.get('type').value).toBe('String');
      expect(form.get('name').value).toBe('testName');
    });

    it('should build nested form structure for complex entities', () => {
      const complexEntity = {
        type: 'Object',
        name: 'parentEntity',
        element: [
          { type: 'String', name: 'childEntity', element: [] }
        ]
      };
      
      const form = component.buildForm(complexEntity);
      const elementArray = form.get('element') as FormArray;
      
      expect(elementArray.length).toBe(1);
      expect(elementArray.at(0).get('type').value).toBe('String');
      expect(elementArray.at(0).get('name').value).toBe('childEntity');
    });

    it('should handle entity without type property', () => {
      const entityWithoutType = { name: 'testName', element: [] };
      const form = component.buildForm(entityWithoutType);
      
      expect(form.get('type')).toBeDefined();
      expect(form.get('name')).toBeDefined();
      expect(form.get('element')).toBeDefined();
    });

    it('should handle entity without name property', () => {
      const entityWithoutName = { type: 'String', element: [] };
      const form = component.buildForm(entityWithoutName);
      
      expect(form.get('type')).toBeDefined();
      expect(form.get('name')).toBeDefined();
      expect(form.get('element')).toBeDefined();
    });

    it('should handle deeply nested structures', () => {
      const deepEntity = {
        type: 'Object',
        name: 'root',
        element: [
          {
            type: 'Object',
            name: 'level1',
            element: [
              { type: 'String', name: 'level2', element: [] }
            ]
          }
        ]
      };
      
      const form = component.buildForm(deepEntity);
      const level1Array = form.get('element') as FormArray;
      const level2Array = level1Array.at(0).get('element') as FormArray;
      
      expect(level1Array.length).toBe(1);
      expect(level2Array.length).toBe(1);
      expect(level2Array.at(0).get('name').value).toBe('level2');
    });
  });

  describe('addElement method', () => {
    it('should add new element to the form array', () => {
      const initialLength = (component.ruleEngineForm.get('element') as FormArray).length;
      component.addElement('element.');
      
      const newLength = (component.ruleEngineForm.get('element') as FormArray).length;
      expect(newLength).toBe(initialLength + 1);
    });

    it('should add element with default subData structure', () => {
      component.addElement('element.');
      const elementArray = component.ruleEngineForm.get('element') as FormArray;
      const lastElement = elementArray.at(elementArray.length - 1);
      
      expect(lastElement.get('type')).toBeDefined();
      expect(lastElement.get('name')).toBeDefined();
      expect(lastElement.get('element')).toBeDefined();
    });

    it('should handle nested element addition', () => {
      // First add an element to make the form structure more complex
      component.addElement('element.');
      const elementArray = component.ruleEngineForm.get('element') as FormArray;
      const initialNestedLength = (elementArray.at(0).get('element') as FormArray).length;
      
      // Add nested element
      component.addElement('element.0.element.');
      const newNestedLength = (elementArray.at(0).get('element') as FormArray).length;
      
      expect(newNestedLength).toBe(initialNestedLength + 1);
    });

    it('should add multiple elements correctly', () => {
      const initialLength = (component.ruleEngineForm.get('element') as FormArray).length;
      
      component.addElement('element.');
      component.addElement('element.');
      component.addElement('element.');
      
      const newLength = (component.ruleEngineForm.get('element') as FormArray).length;
      expect(newLength).toBe(initialLength + 3);
    });
  });

  describe('deleteElement method', () => {
    beforeEach(() => {
      // Add some elements to test deletion
      component.addElement('element.');
      component.addElement('element.');
    });

    it('should remove element from the form array', () => {
      const elementArray = component.ruleEngineForm.get('element') as FormArray;
      const initialLength = elementArray.length;
      
      component.deleteElement('element.', 1);
      
      const newLength = elementArray.length;
      expect(newLength).toBe(initialLength - 1);
    });

    it('should remove the correct element at specified index', () => {
      const elementArray = component.ruleEngineForm.get('element') as FormArray;
      // Set distinct values to track which element is removed
      elementArray.at(0).get('name').setValue('first');
      elementArray.at(1).get('name').setValue('second');
      elementArray.at(2).get('name').setValue('third');
      
      component.deleteElement('element.', 1);
      
      expect(elementArray.at(0).get('name').value).toBe('first');
      expect(elementArray.at(1).get('name').value).toBe('third');
    });

    it('should handle deletion of nested elements', () => {
      const elementArray = component.ruleEngineForm.get('element') as FormArray;
      const nestedArray = elementArray.at(0).get('element') as FormArray;
      nestedArray.push(component.buildForm(subData));
      
      const initialNestedLength = nestedArray.length;
      component.deleteElement('element.0.element.', 0);
      
      const newNestedLength = nestedArray.length;
      expect(newNestedLength).toBe(initialNestedLength - 1);
    });

    it('should handle deletion of all elements except the last one', () => {
      const elementArray = component.ruleEngineForm.get('element') as FormArray;
      const totalElements = elementArray.length;
      
      // Delete all but the last element
      for (let i = totalElements - 1; i > 0; i--) {
        component.deleteElement('element.', i);
      }
      
      expect(elementArray.length).toBe(1);
    });
  });

  describe('changeType method', () => {
    let mockEvent: any;

    beforeEach(() => {
      mockEvent = {
        target: {
          value: 'Object'
        }
      };
    });

    it('should add sub-element when type is changed to Object', () => {
      const elementArray = component.ruleEngineForm.get('element') as FormArray;
      const initialSubLength = (elementArray.at(0).get('element') as FormArray).length;
      
      component.changeType(mockEvent, 'element.0');
      
      const newSubLength = (elementArray.at(0).get('element') as FormArray).length;
      expect(newSubLength).toBe(initialSubLength + 1);
    });

    it('should clear sub-elements when type is changed to non-Object', () => {
      // First change to Object to add sub-elements
      component.changeType(mockEvent, 'element.0');
      
      // Then change to String to clear sub-elements
      mockEvent.target.value = 'String';
      component.changeType(mockEvent, 'element.0');
      
      const elementArray = component.ruleEngineForm.get('element') as FormArray;
      const subElementArray = elementArray.at(0).get('element') as FormArray;
      
      expect(subElementArray.length).toBe(0);
    });

    it('should handle Number type change', () => {
      mockEvent.target.value = 'Number';
      component.changeType(mockEvent, 'element.0');
      
      const elementArray = component.ruleEngineForm.get('element') as FormArray;
      const subElementArray = elementArray.at(0).get('element') as FormArray;
      
      expect(subElementArray.length).toBe(0);
    });

    it('should handle Boolean type change', () => {
      mockEvent.target.value = 'Boolean';
      component.changeType(mockEvent, 'element.0');
      
      const elementArray = component.ruleEngineForm.get('element') as FormArray;
      const subElementArray = elementArray.at(0).get('element') as FormArray;
      
      expect(subElementArray.length).toBe(0);
    });

    it('should handle invalid prefix gracefully', () => {
      const mockEvent = { target: { value: 'Object' } };
      // Invalid prefix will cause form.get() to fail
      expect(() => component.changeType(mockEvent, 'invalid.prefix')).toThrow();
    });

    it('should handle multiple type changes', () => {
      const elementArray = component.ruleEngineForm.get('element') as FormArray;
      
      // Object -> String -> Object
      component.changeType(mockEvent, 'element.0');
      expect((elementArray.at(0).get('element') as FormArray).length).toBe(1);
      
      mockEvent.target.value = 'String';
      component.changeType(mockEvent, 'element.0');
      expect((elementArray.at(0).get('element') as FormArray).length).toBe(0);
      
      mockEvent.target.value = 'Object';
      component.changeType(mockEvent, 'element.0');
      expect((elementArray.at(0).get('element') as FormArray).length).toBe(1);
    });
  });

  describe('onSubmit method', () => {
    it('should log form value when onSubmit is called', () => {
      spyOn(console, 'log');
      
      component.onSubmit();
      
      expect(console.log).toHaveBeenCalledWith(component.ruleEngineForm.value);
    });

    it('should submit form with current values', () => {
      const elementArray = component.ruleEngineForm.get('element') as FormArray;
      elementArray.at(0).get('name').setValue('testEntity');
      elementArray.at(0).get('type').setValue('String');
      
      spyOn(console, 'log');
      
      component.onSubmit();
      
      expect(console.log).toHaveBeenCalledWith(jasmine.objectContaining({
        element: jasmine.arrayContaining([
          jasmine.objectContaining({
            name: 'testEntity',
            type: 'String'
          })
        ])
      }));
    });

    it('should submit complex nested form structure', () => {
      const elementArray = component.ruleEngineForm.get('element') as FormArray;
      elementArray.at(0).get('name').setValue('parentEntity');
      elementArray.at(0).get('type').setValue('Object');
      
      // Add nested element
      component.changeType({ target: { value: 'Object' } }, 'element.0');
      const nestedArray = elementArray.at(0).get('element') as FormArray;
      nestedArray.at(0).get('name').setValue('childEntity');
      nestedArray.at(0).get('type').setValue('String');
      
      spyOn(console, 'log');
      component.onSubmit();
      
      expect(console.log).toHaveBeenCalledWith(jasmine.objectContaining({
        element: jasmine.arrayContaining([
          jasmine.objectContaining({
            name: 'parentEntity',
            type: 'Object',
            element: jasmine.arrayContaining([
              jasmine.objectContaining({
                name: 'childEntity',
                type: 'String'
              })
            ])
          })
        ])
      }));
    });
  });

  describe('Form validation and behavior', () => {
    it('should have valid form by default', () => {
      expect(component.ruleEngineForm.valid).toBe(true);
    });

    it('should maintain form validity after adding elements', () => {
      component.addElement('element.');
      expect(component.ruleEngineForm.valid).toBe(true);
    });

    it('should maintain form validity after deleting elements', () => {
      component.addElement('element.');
      component.deleteElement('element.', 1);
      expect(component.ruleEngineForm.valid).toBe(true);
    });

    it('should maintain form validity after type changes', () => {
      const mockEvent = { target: { value: 'Object' } };
      component.changeType(mockEvent, 'element.0');
      expect(component.ruleEngineForm.valid).toBe(true);
    });

    it('should track form changes correctly', () => {
      expect(component.ruleEngineForm.pristine).toBe(true);
      
      const elementArray = component.ruleEngineForm.get('element') as FormArray;
      elementArray.at(0).get('name').setValue('changedName');
      
      expect(component.ruleEngineForm.pristine).toBe(false);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete workflow: add, modify, and delete elements', () => {
      // Add elements
      component.addElement('element.');
      component.addElement('element.');
      
      const elementArray = component.ruleEngineForm.get('element') as FormArray;
      expect(elementArray.length).toBe(3); // 1 initial + 2 added
      
      // Modify element types and names
      elementArray.at(0).get('name').setValue('entity1');
      elementArray.at(0).get('type').setValue('String');
      elementArray.at(1).get('name').setValue('entity2');
      elementArray.at(1).get('type').setValue('Number');
      elementArray.at(2).get('name').setValue('entity3');
      elementArray.at(2).get('type').setValue('Object');
      
      // Change to Object type to add nested elements
      component.changeType({ target: { value: 'Object' } }, 'element.2');
      const nestedArray = elementArray.at(2).get('element') as FormArray;
      expect(nestedArray.length).toBe(1);
      
      // Delete middle element
      component.deleteElement('element.', 1);
      expect(elementArray.length).toBe(2);
      
      // Check the first element still exists (it should be entity1)
      if (elementArray.length > 0) {
        expect(elementArray.at(0).get('name').value).toBe('entity1');
      }
      
      // Check the second element (it should be entity3, previously at index 2)
      if (elementArray.length > 1) {
        expect(elementArray.at(1).get('name').value).toBe('entity3');
      }
      
      // Form should remain valid throughout
      expect(component.ruleEngineForm.valid).toBe(true);
    });

    it('should handle nested object creation and modification', () => {
      const elementArray = component.ruleEngineForm.get('element') as FormArray;
      
      // Create nested structure
      elementArray.at(0).get('name').setValue('rootObject');
      elementArray.at(0).get('type').setValue('Object');
      component.changeType({ target: { value: 'Object' } }, 'element.0');
      
      const nestedArray = elementArray.at(0).get('element') as FormArray;
      if (nestedArray.length > 0) {
        nestedArray.at(0).get('name').setValue('nestedObject');
        nestedArray.at(0).get('type').setValue('Object');
        component.changeType({ target: { value: 'Object' } }, 'element.0.element.0');
        
        const deepNestedArray = nestedArray.at(0).get('element') as FormArray;
        if (deepNestedArray.length > 0) {
          deepNestedArray.at(0).get('name').setValue('deepNestedProperty');
          deepNestedArray.at(0).get('type').setValue('String');
          
          // Verify the structure
          expect(elementArray.at(0).get('name').value).toBe('rootObject');
          expect(nestedArray.at(0).get('name').value).toBe('nestedObject');
          expect(deepNestedArray.at(0).get('name').value).toBe('deepNestedProperty');
          expect(deepNestedArray.at(0).get('type').value).toBe('String');
        }
      }
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle empty prefix in addElement', () => {
      // With empty prefix, slice(0, -1) will give us empty string, 
      // which will cause the form.get() to fail - this is expected behavior
      expect(() => component.addElement('')).toThrow();
    });

    it('should handle invalid prefix in addElement', () => {
      // Invalid prefix will cause form.get() to fail
      expect(() => component.addElement('invalid.prefix.')).toThrow();
    });

    it('should handle out of bounds index in deleteElement', () => {
      // Angular's FormArray.removeAt will handle out of bounds gracefully
      expect(() => component.deleteElement('element.', 999)).not.toThrow();
    });

    it('should handle negative index in deleteElement', () => {
      // Angular's FormArray.removeAt will handle negative index gracefully
      expect(() => component.deleteElement('element.', -1)).not.toThrow();
    });

    it('should handle null event value in changeType', () => {
      // The component checks $event.target.value, so this should not throw
      const nullEvent = { target: { value: null } };
      expect(() => component.changeType(nullEvent, 'element.0')).not.toThrow();
    });

    it('should handle undefined event target in changeType', () => {
      // This will cause a runtime error when accessing undefined.value
      const undefinedEvent = { target: undefined };
      expect(() => component.changeType(undefinedEvent, 'element.0')).toThrow();
    });
  });
});
