export interface ISeriesRepository {

    saveData(name: string, value: number, timestamp: number, token: string): Promise<boolean>;
    getData(name: string, timestamp: number, token: string): Promise<Array<{ timestamp: string, x: number, y: number }>>;
    listNames(token: string): Promise<string[]>;
    clearStaleData(hours: number): Promise<boolean>;
}
