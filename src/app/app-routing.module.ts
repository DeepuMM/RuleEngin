import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RuleEngineComponent } from './rule-engine/rule-engine.component';


const routes: Routes = [
  {
    path: "", pathMatch: "full" , redirectTo: "rule-engine"
  },
  {
    path: "rule-engine", component: RuleEngineComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
