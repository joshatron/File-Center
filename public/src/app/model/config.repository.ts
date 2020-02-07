import { Injectable } from "@angular/core";
import { Config } from "./config.model";
import { RestDataSource } from "./rest.datasource";

@Injectable()
export class ConfigRepository {
    private config: Config;

    constructor(private dataSource: RestDataSource) {
        dataSource.getConfig().subscribe(data => this.config = data);
    }

    getBanner(): string {
        return this.config.banner;
    }

    getUploads(): boolean {
        return this.config.uploads;
    }
}
