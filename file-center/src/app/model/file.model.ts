export class File {
    constructor(
        public name: string,
        public size: number,
        public type: string,
        public files: File[]) {}
}
