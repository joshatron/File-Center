export class Model {
    title;
    files;

    constructor() {
        this.title = "Josh's File Center";
        this.files = [new File("file1.txt", 1000, "file", false),
                      new File("file2.txt", 2000, "file", false),
                      new File("file3.txt", 1000, "file", false)];
                     
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
