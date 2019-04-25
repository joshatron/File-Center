export class File {
    public selected = false;

    constructor(
        public name: string,
        public size: number,
        public type: string,
        public files: File[]) {}
}
