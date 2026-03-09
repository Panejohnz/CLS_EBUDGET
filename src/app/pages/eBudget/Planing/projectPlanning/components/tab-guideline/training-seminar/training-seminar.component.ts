import { Component } from '@angular/core';
interface Project {
  name: string
  location: string
  detail: string
  file: File | null
  expenses: any[]
}
@Component({
  selector: 'app-training-seminar',

  templateUrl: './training-seminar.component.html',
  styleUrl: './training-seminar.component.scss'
})

export class TrainingSeminarComponent {
  projects: Project[] = [
    {
      name: '',
      location: '',
      detail: '',
      file: null,
      expenses: [{}]
    }
  ]
  expenseTotal: number = 0;
  addProject() {

    this.projects.push({
      name: '',
      location: '',
      detail: '',
      file: null,
      expenses: [{}]
    })

  }

  removeProject(index: number) {

    this.projects.splice(index, 1)

  }

  addExpense(project: any) {

    project.expenses.push({})

  }

  removeExpense(project: any, index: number) {

    project.expenses.splice(index, 1)

  }
  onFileSelected(event: any, project: Project) {

    const file = event.target.files[0]

    if (file) {
      project.file = file
    }

  }
  calculateExpense(project: any) {

    project.expenses.forEach((exp: any) => {

      const times = exp.times || 0;

      const totalPerson =
        (exp.a || 0) +
        (exp.b || 0) +
        (exp.external || 0) +
        (exp.person || 0);

      const duration = exp.duration || 0;
      const rate = exp.rate || 0;

      exp.total = times * totalPerson * duration * rate;

    });

    this.calculateExpenseTotal(project);
  }
  calculateExpenseTotal(project: any) {

    project.expenseTotal = 0;

    project.expenses.forEach((exp: any) => {
      project.expenseTotal += exp.total || 0;
    });
    this.expenseTotal = project.expenseTotal
  }
}
