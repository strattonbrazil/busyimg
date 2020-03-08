const { Sequelize, Model, DataTypes, Column, DataType } = require('sequelize');

export class User extends Model {}
export class BusyImage extends Model {}

let db: any = null;

export function initDatabase(url: string | undefined)
{
    db = new Sequelize(url);

    User.init({
        reference: DataTypes.STRING, // provider:email
        name: DataTypes.STRING, // unused right now

        misc: DataTypes.JSON // nasty RAW JSON thing
    }, { sequelize: db, modelName: 'user' });

    BusyImage.init({
        userId: DataTypes.INTEGER,
        hash: DataTypes.STRING,
        resource: DataTypes.STRING,

        // image metadata
        caption: DataTypes.STRING,

        misc: DataTypes.JSON // nasty RAW JSON thing
    }, { sequelize: db, modelName: 'image' });

    db.sync({
        alter: true
    });
}

export async function isDatabaseConnected(): Promise<boolean> {
    try {
        await db.authenticate();
        return true;
    } catch (error) {
        return false;
    }
}