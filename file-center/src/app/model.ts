export class Model {
    title;
    files;

    constructor() {
        this.title = "Josh's File Center";
        this.files = [new File("file1.txt", 1000, "file"),
                      new File("file2.txt", 2000, "file"),
                      new File("file3.txt", 1000, "file")];
                     
    }
}

export class File {
    name;
    size;
    type;

    constructor(name, size, type) {
        this.name = name;
        this.size = size;
        this.type = type;
    }
}
