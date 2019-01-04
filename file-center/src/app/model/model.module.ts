import { NgModule } from "@angular/core";
import { FileRepository } from "./file.repository";
import { StaticDataSource } from "./static.datasource";

@NgModule({
    providers: [FileRepository, StaticDataSource]
})

export class ModelModule {}
