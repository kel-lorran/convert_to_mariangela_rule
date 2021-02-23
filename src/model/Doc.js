import Line from './Line';

export default class Doc {
    constructor(rawText) {
        this.lineList = rawText.match(/^.+TABLE[\w|\W]+?;/gm)
            .map(l => new Line(
                l.match(/^.+TABLE/)[0].toLowerCase(),
                l
            ));
    }

    convert() {
        const mapOfLine = {};
        this.lineList.filter(l => l.type === 'create table').forEach(l => mapOfLine[l.tableName] = l);
        this.lineList.filter(l => l.type !== 'create table').forEach(({ tableName, attributesAreKey }) => {
            mapOfLine[tableName].attributesAreKey = attributesAreKey
        });

        const createTableLines = [];
        const constrainNotNullLines = [];
        this.lineList.filter(l => l.type === 'create table')
            .forEach(lTarget => {
                createTableLines.push(lTarget.getWithoutNotNullText());
                constrainNotNullLines.push(...lTarget.generateCheckConstrainsNotNull())
            })

        return [...createTableLines, ...this.lineList.filter(l => l.type !== 'create table'), ...constrainNotNullLines]
            .map(({textContent}) => textContent)
            .join('\n\n')
    }
}