import { AnswerBlock } from "../admin/types";

export interface SharedQuestion {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  tags: string[];
  difficulty: "easy" | "medium" | "hard";
  status: "draft" | "published";
  order: number;
  answer: AnswerBlock[];
}

export interface SharedCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  order: number;
}

export const categories: SharedCategory[] = [
  { id: "cat-1", name: "Angular", slug: "angular", icon: "🅰️", order: 1 },
  { id: "cat-2", name: "RxJS", slug: "rxjs", icon: "🔄", order: 2 },
  { id: "cat-3", name: "TypeScript", slug: "typescript", icon: "📘", order: 3 },
  { id: "cat-4", name: "NgRx", slug: "ngrx", icon: "📦", order: 4 },
  { id: "cat-5", name: "Testing", slug: "testing", icon: "🧪", order: 5 },
];

export const questions: SharedQuestion[] = [
  {
    id: "q-1",
    title: "What is Angular Framework?",
    slug: "what-is-angular",
    categoryId: "cat-1",
    tags: ["Angular", "Framework"],
    difficulty: "easy",
    status: "published",
    order: 1,
    answer: [
      { id: "b-1", type: "paragraph", content: "Angular is a TypeScript-based open-source front-end platform that makes it easy to build web, mobile and desktop applications." },
      { id: "b-2", type: "heading", level: 3, text: "Key Features" },
      { id: "b-3", type: "numbered-list", items: [
        { id: "i-1", title: "Declarative Templates", description: "Templates that describe the UI" },
        { id: "i-2", title: "Dependency Injection", description: "Built-in DI system" },
        { id: "i-3", title: "End-to-end Tooling", description: "CLI, testing, and more" },
      ]},
    ],
  },
  {
    id: "q-2",
    title: "What is the difference between AngularJS and Angular?",
    slug: "angularjs-vs-angular",
    categoryId: "cat-1",
    tags: ["AngularJS", "Angular"],
    difficulty: "medium",
    status: "published",
    order: 2,
    answer: [
      { id: "b-1", type: "paragraph", content: "AngularJS (version 1.x) is a JavaScript framework, whereas Angular (version 2+) is a complete rewrite using TypeScript, providing better performance, mobile support, modularity, and a more modern architecture." },
      { id: "b-2", type: "heading", level: 3, text: "Major Differences" },
      { id: "b-3", type: "table", columns: ["Feature", "AngularJS", "Angular"], headerEnabled: true, rows: [
        { id: "r-1", cells: [{ id: "c-1", content: "Language" }, { id: "c-2", content: "JavaScript" }, { id: "c-3", content: "TypeScript" }] },
        { id: "r-2", cells: [{ id: "c-4", content: "Architecture" }, { id: "c-5", content: "MVC-based" }, { id: "c-6", content: "Component-based" }] },
        { id: "r-3", cells: [{ id: "c-7", content: "Mobile Support" }, { id: "c-8", content: "Limited" }, { id: "c-9", content: "Better support" }] },
        { id: "r-4", cells: [{ id: "c-10", content: "Performance" }, { id: "c-11", content: "Lower" }, { id: "c-12", content: "Better" }] },
        { id: "r-5", cells: [{ id: "c-13", content: "Data Binding" }, { id: "c-14", content: "Two-way" }, { id: "c-15", content: "One-way and two-way" }] },
      ]},
    ],
  },
  {
    id: "q-3",
    title: "What is TypeScript?",
    slug: "what-is-typescript",
    categoryId: "cat-3",
    tags: ["TypeScript", "JavaScript"],
    difficulty: "easy",
    status: "published",
    order: 3,
    answer: [
      { id: "b-1", type: "paragraph", content: "TypeScript is a strongly typed superset of JavaScript created by Microsoft that adds optional types, classes, async/await and many other features, and compiles to plain JavaScript." },
      { id: "b-2", type: "heading", level: 3, text: "Key Features" },
      { id: "b-3", type: "bullet-list", items: [
        { id: "i-1", title: "Static Type Checking", description: "Catches errors at compile time" },
        { id: "i-2", title: "Interfaces & Generics", description: "Powerful type system" },
        { id: "i-3", title: "ES6+ Features", description: "Supports modern JavaScript features" },
      ]},
      { id: "b-4", type: "code", language: "typescript", code: "function greet(name: string): string {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet('World'));" },
    ],
  },
  {
    id: "q-4",
    title: "What are lifecycle hooks available?",
    slug: "lifecycle-hooks",
    categoryId: "cat-1",
    tags: ["Lifecycle", "Components"],
    difficulty: "medium",
    status: "published",
    order: 4,
    answer: [
      { id: "b-1", type: "paragraph", content: "Angular components have a lifecycle that starts when they are created and ends when they are destroyed. Angular provides lifecycle hooks that allow you to tap into these events." },
      { id: "b-2", type: "heading", level: 3, text: "Common Lifecycle Hooks" },
      { id: "b-3", type: "numbered-list", items: [
        { id: "i-1", title: "ngOnInit", description: "Called after the component is initialized" },
        { id: "i-2", title: "ngOnChanges", description: "Called when an input property changes" },
        { id: "i-3", title: "ngDoCheck", description: "Called for custom change detection" },
        { id: "i-4", title: "ngAfterViewInit", description: "Called after the view is initialized" },
        { id: "i-5", title: "ngOnDestroy", description: "Called before the component is destroyed" },
      ]},
    ],
  },
  {
    id: "q-5",
    title: "What is the difference between promise and observable?",
    slug: "promise-vs-observable",
    categoryId: "cat-2",
    tags: ["Promise", "Observable", "RxJS"],
    difficulty: "medium",
    status: "published",
    order: 5,
    answer: [
      { id: "b-1", type: "paragraph", content: "Promises and Observables are both used for asynchronous operations, but they have key differences in how they handle values and execution." },
      { id: "b-2", type: "heading", level: 3, text: "Comparison Table" },
      { id: "b-3", type: "table", columns: ["Feature", "Promise", "Observable"], headerEnabled: true, rows: [
        { id: "r-1", cells: [{ id: "c-1", content: "Execution" }, { id: "c-2", content: "Immediate (eager)" }, { id: "c-3", content: "Lazy (on subscription)" }] },
        { id: "r-2", cells: [{ id: "c-4", content: "Values" }, { id: "c-5", content: "Single value" }, { id: "c-6", content: "Multiple values over time" }] },
        { id: "r-3", cells: [{ id: "c-7", content: "Cancellation" }, { id: "c-8", content: "Not supported" }, { id: "c-9", content: "Supported via unsubscribe" }] },
        { id: "r-4", cells: [{ id: "c-10", content: "Operators" }, { id: "c-11", content: "then/catch" }, { id: "c-12", content: "Rich operator library (map, filter, etc.)" }] },
      ]},
    ],
  },
  {
    id: "q-6",
    title: "What are components?",
    slug: "what-are-components",
    categoryId: "cat-1",
    tags: ["Components", "Angular"],
    difficulty: "easy",
    status: "published",
    order: 6,
    answer: [
      { id: "b-1", type: "paragraph", content: "Components are the most basic UI building block of an Angular app. They form a tree of Angular components and are a subset of directives." },
      { id: "b-2", type: "code", language: "typescript", code: "import { Component } from '@angular/core';\n\n@Component({\n  selector: 'app-hello',\n  template: '<h1>Hello, {{name}}!</h1>'\n})\nexport class HelloComponent {\n  name = 'World';\n}" },
    ],
  },
  {
    id: "q-7",
    title: "What are directives?",
    slug: "what-are-directives",
    categoryId: "cat-1",
    tags: ["Directives", "Angular"],
    difficulty: "easy",
    status: "published",
    order: 7,
    answer: [
      { id: "b-1", type: "paragraph", content: "Directives add behavior to an existing DOM element or an existing component instance. They are used to manipulate the DOM." },
      { id: "b-2", type: "heading", level: 3, text: "Types of Directives" },
      { id: "b-3", type: "bullet-list", items: [
        { id: "i-1", title: "Component Directives", description: "Directives with a template" },
        { id: "i-2", title: "Structural Directives", description: "Change DOM layout (ngIf, ngFor)" },
        { id: "i-3", title: "Attribute Directives", description: "Change appearance or behavior" },
      ]},
    ],
  },
  {
    id: "q-8",
    title: "What is dependency injection in Angular?",
    slug: "dependency-injection",
    categoryId: "cat-1",
    tags: ["DI", "Angular"],
    difficulty: "medium",
    status: "published",
    order: 8,
    answer: [
      { id: "b-1", type: "paragraph", content: "Dependency injection (DI) is an important application design pattern in which a class asks for dependencies from external sources rather than creating them itself." },
      { id: "b-2", type: "code", language: "typescript", code: "import { Injectable } from '@angular/core';\n\n@Injectable({ providedIn: 'root' })\nexport class UserService {\n  getUsers() {\n    return ['Alice', 'Bob'];\n  }\n}" },
    ],
  },
];
