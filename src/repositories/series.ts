export interface ISeriesRepository {

    saveData(name: string, value: number, timestamp: number, token: string, tags: {}): Promise<boolean>;
    getData(name: string, timestamp: number, token: string, tags: {}): Promise<Array<{ timestamp: string, x: number, y: number }>>;
    listNames(token: string): Promise<string[]>;
    clearStaleData(hours: number): Promise<boolean>;
}
