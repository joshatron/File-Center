export class Model {
    title;
    files;

    constructor() {
        this.title = "Josh's File Center";
        this.files = [new File("file1.txt", 972, "file", false),
                      new File("file2.txt", 2530, "file", false),
                      new File("folder1", 1350000, "directory", false)];
                     
    }
}

export class File {
    name;
    size;
    type;
    selected;

    constructor(name, size, type, selected) {
        this.name = name;
        this.size = size;
        this.type = type;
        this.selected = selected;
    }
}
