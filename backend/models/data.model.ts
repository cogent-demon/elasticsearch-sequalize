import { Table, Column, Model, HasMany, DataType } from 'sequelize-typescript';

@Table({ tableName: "datas", timestamps: false })
export default class Data extends Model {

  @Column(DataType.TEXT)
  url: string;
  
  @Column(DataType.TEXT)
  description: string;
  
  @Column(DataType.TEXT)
  duration: string;
  
  @Column(DataType.TEXT)
  thumbnail: string;
  
  @Column(DataType.TEXT)
  iframe: string;
  
  @Column(DataType.TEXT)
  keywords: string;
  
  @Column(DataType.TEXT)
  author: string;
  
  @Column(DataType.TEXT)
  no: string;
  
  @Column(DataType.TEXT)
  type: string;
  
  @Column(DataType.TEXT)
  quality: string;

}