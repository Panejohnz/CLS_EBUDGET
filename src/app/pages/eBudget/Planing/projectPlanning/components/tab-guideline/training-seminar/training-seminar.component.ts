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
}
