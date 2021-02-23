export default class Line {
    constructor(type, content) {
        this.type = type;
        this.textContent = content;
        this.attributesToCreateCheckConstrainsNotNull = [];
        this.tableName = '';
        this._attributesAreKey = [];

        const tableNameResultMatch = content.match(/(?<=TABLE\s)\w+/gmi);
        if (tableNameResultMatch)
            this.tableName = tableNameResultMatch[0];

        this.constrainType = '';
        const rawConstrainTypeResultMatch = content.match(/(?<=Constraint\s).+(?=\s\()/gmi)

        if (type === 'alter table' && rawConstrainTypeResultMatch) {
            this.constrainType = rawConstrainTypeResultMatch[0].replace(/^\w+\s/, '');
            this.attributesAreKey = this.textContent.match(new RegExp(`(?<=${this.constrainType}\\s\\().+(?=\\))`))[0].trim();
        }
    }

    get attributesAreKey() { return this._attributesAreKey }

    set attributesAreKey(value) {
        if(typeof value === 'string')
            this._attributesAreKey.push(value)
        else
            this._attributesAreKey.push(...value)
    }

    getWithoutNotNullText() {
        if(this.type === 'create table') {
            const removeNotNullText = text => text.replace(/not null/gi, '');
            // remover NOT NULL da linha do id
            this.textContent = this.textContent.match(/.+\n|.+/g)
                .reduce((acc, line, i, { length }) => {
                    switch (i) {
                        case 0:
                            return line.toUpperCase();
                        case (length - 1):
                            return acc += line;
                        default:
                            const resultMatch = line.match(/\w+/)
                            if(resultMatch && !this.attributesAreKey.includes(resultMatch[0]))
                                this.attributesToCreateCheckConstrainsNotNull.push(resultMatch[0]);
                            return acc += removeNotNullText(line);
                    }
                }, '');
        }
        // this.textContent += '\n\n';
        return this;
    }

    generateCheckConstrainsNotNull() {
        return this.attributesToCreateCheckConstrainsNotNull
            .map((att, i) => new Line(
                'alter table',
                `ALTER TABLE ${this.tableName} 
            ADD CONSTRAINT ck_${att.replace(/_.+/, '')}_nn_${i + 1} CHECK ( ${att} IS NOT NULL );`
            )
            );
    }
}