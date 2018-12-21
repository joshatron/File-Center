improt { NgModule } from "@angular/core";
import { FileRepository } from "./file.repository";
import { StaticDataSource } from "./static.datasource";

@NGModule({
    providers: [FileRepository, StaticdataSource]
})
export class ModelModule {}
