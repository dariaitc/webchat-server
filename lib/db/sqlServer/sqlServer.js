const sql = require('mssql')
let mssql = require('./mssql-pool-management')
// const sqlServers = require('../settings').sqlServers

const configSv3Sql = {
    user: process.env.SQL_SV3_USER,//sqlServers.sv3.sqlUser,
    password: process.env.SQL_SV3_PASSWORD,//sqlServers.sv3.sqlPassword,
    server: process.env.SQL_SV3_IP,//sqlServers.sv3.sqlIP, // You can use 'localhost\\instance' to connect to named instance
    port: Number(process.env.SQL_SV3_PORT),//sqlServers.sv3.sqlPort,
    database: process.env.SQL_SV3_DATABASE,//sqlServers.sv3.sqlDatabase,
    options: {
        enableArithAbort: true,
        trustServerCertificate: true,
        encrypt: true,
        useUTC: false
    }
    // enableArithAbort:true
}

const configSv2Sql = {
    user: process.env.SQL_SV2_USER,//sqlServers.sv2.sqlUser,
    password: process.env.SQL_SV2_PASSWORD,//sqlServers.sv2.sqlPassword,
    server: process.env.SQL_SV2_IP,//sqlServers.sv2.sqlIP, // You can use 'localhost\\instance' to connect to named instance
    port: Number(process.env.SQL_SV2_PORT),//sqlServers.sv2.sqlPort,
    database: process.env.SQL_SV2_DATABASE,//sqlServers.sv2.sqlDatabase,
    options: {
        enableArithAbort: true,
        trustServerCertificate: true,
        encrypt: true,
        useUTC: false
    }
}

sql.Table.prototype.toString = function () {
    let stringStruct = ''
    this.rows.forEach(row => {
        let rowString = '('
        row.forEach((col, index, arr) => {
            let toAdd
            if (typeof col === 'string') {
                toAdd = `\'${col}\'`
            }
            else if (typeof col === 'object' && col instanceof Date){
                toAdd = `\'${(new Date(col)).toISOString()}\'`
            }
            else {
                toAdd = col
            }
            if (index !== arr.length - 1) {
                rowString += `${toAdd},`
            }
            else {
                rowString += `${toAdd}), `
            }

        })

        stringStruct += rowString
    })
    return stringStruct.slice(0,stringStruct.length-2)
}

sql.Table.prototype.getArrayOfRowString = function () {
    const arrRowString = []
    this.rows.forEach(row => {
        let rowString = '('
        row.forEach((col, index, arr) => {
            let toAdd
            if (typeof col === 'string') {
                toAdd = `\'${col}\'`
            }
            else if (typeof col === 'object' && col instanceof Date){
                toAdd = `\'${(new Date(col)).toISOString()}\'`
            }
            else {
                toAdd = col
            }
            if (index !== arr.length - 1) {
                rowString += `${toAdd},`
            }
            else {
                rowString += `${toAdd})`
            }

        })

        arrRowString.push(rowString)
    })
    return arrRowString
}

exports.getSv2SqlInstance = async () => {
    let sqlPool = await mssql.GetCreateIfNotExistPool(configSv2Sql)
    return new sql.Request(sqlPool)
}

exports.getSv3SqlInstance = async () => {
    let sqlPool = await mssql.GetCreateIfNotExistPool(configSv3Sql)
    return new sql.Request(sqlPool)
}

exports.getSvInstanceByNumber = async (svNumber) => {
    if (svNumber === 2) {
        return await exports.getSv2SqlInstance();
    }
    else if (svNumber === 3) {
        return await exports.getSv3SqlInstance();
    }
    else {
        throw new Error('There is no supervision with that number')
    }
}


exports.escapeSqlInjection = (input) => {
    if (typeof input !== 'string') return '';
    const keywords = [
        "SELECT", "UPDATE", "DELETE", "INSERT", "FROM", "WHERE", "AND", "OR", "NOT",
        "LIKE", "IN", "BETWEEN", "GROUP BY", "HAVING", "ORDER BY",
        "CREATE", "ALTER", "EXEC", "DROP",
        "JOIN", "INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN",
        "UNION", "EXCEPT", "INTERSECT",
        "AS", "ON", "TOP", "DISTINCT", "IS", "NULL", "DEFAULT", "INTO", "VALUES",
        "TABLE", "VIEW", "PROCEDURE", "FUNCTION", "TRIGGER", "INDEX", "PRIMARY KEY",
        "FOREIGN KEY", "CHECK", "CONSTRAINT", "UNIQUE", "DEFAULT", "IDENTITY",
        "BEGIN", "END", "COMMIT", "ROLLBACK"
      ];
      const sanitizedInput = input.replace(new RegExp(keywords.join("|"), "gi"), "");
      return sanitizedInput;
    // return value.replace(/'/g, "''").replace(/SELECT/ig, "").replace(/INSERT/ig, "").replace(/DELETE/ig, "").replace(/DROP/ig, "").replace(/ALTER/ig, "").replace(/CREATE/ig, "").replace(/FROM/ig, "").replace(/EXEC/ig, "");

}

exports.getInsertMultiRowsQuery = (tableName, columnsArr, valuesObjArr, opt={}) => {

    const columnsString = columnsArr.reduce((prevValue, curValue, index, arr) => {
        if (index < arr.length - 1) {
            return prevValue + curValue + ','
        }
        else {
            return prevValue + curValue
        }
    }, '');

    let valuesString = valuesObjArr.reduce((prevValue, curValue, index, arr) => {
        let insertRow = '('
        for (let column of columnsArr) {
            let newRowValue = curValue[column] ? `N'${curValue[column]}'` : `null`
            insertRow = insertRow + newRowValue + ','
        }
        insertRow = insertRow.slice(0, -1)
        insertRow += '),'

        return prevValue + insertRow
    }, '')

    valuesString = valuesString.slice(0, -1)

    return `INSERT INTO ${tableName} (${columnsString}) ${opt.idName ? `OUTPUT INSERTED.${opt.idName}` : ''} VALUES ${valuesString}`;

}
