export interface ISeriesRepository {

    saveData(name: string, value: number, timestamp: number): Promise<boolean>;
    getData(name: string, timestamp: number): Promise<Array<{ timestamp: string, x: number, y: number }>>;
    listNames(): Promise<string[]>;
    clearStaleData(hours: number): Promise<boolean>;
}
