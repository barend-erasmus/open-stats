export class StatsService {

    public calculateMean(data: number[]): number {
        let total = 0;

        for (let i = 0; i < data.length; i += 1) {
            total += data[i];
        }
        return total / data.length;
    }

    public calculateMedian(data: number[]): number {
        data.sort();

        if (data.length % 2 === 0) {
            return (data[data.length / 2 - 1] + data[data.length / 2]) / 2;
        } else {

            return data[(data.length - 1) / 2];
        }
    }

    public calculateMinimum(data: number[]): number {
        data.sort();

        return data[0];

    }

    public calculateMaximum(data: number[]): number {
        data.sort();

        return data[data.length - 1];

    }

    public calculateSum(data: number[]): number {
        let total = 0;

        for (let i = 0; i < data.length; i += 1) {
            total += data[i];
        }

        return total;
    }

    public calculateStandardDeviation(data: number[]): number {
        const mean = this.calculateMean(data);

        const a: number[] = data.map((x) => Math.pow(x - mean, 2));

        const newMean: number = this.calculateMean(a);

        return Math.sqrt(newMean);
    }
}
