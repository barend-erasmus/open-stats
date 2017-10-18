export interface ISeriesRepository {

    saveData(name: string, value: number, timestamp: number, token: string, tags: {}): Promise<boolean>;
    getData(name: string, timestamp: number, token: string, tags: {}): Promise<Array<{ timestamp: string, x: number, y: number, tags: {} }>>;
    getAggregatedData(name: string, timestamp: number, token: string, tags: {}, aggregate: string, intervalInMinutes: number): Promise<Array<{ timestamp: string, x: number, y: number, tags: {} }>>;
    listNames(token: string): Promise<string[]>;
    clearStaleData(hours: number): Promise<boolean>;
}
