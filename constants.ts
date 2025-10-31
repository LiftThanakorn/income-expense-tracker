import { TransactionType } from './types';

export const CATEGORIES: { [key in TransactionType]: string[] } = {
    [TransactionType.INCOME]: [
        'เงินเดือน',
        'รายได้เสริม',
        'โบนัส',
        'เงินลงทุน',
        'อื่นๆ',
    ],
    [TransactionType.EXPENSE]: [
        'อาหาร',
        'เดินทาง',
        'ที่อยู่อาศัย',
        'ของใช้ส่วนตัว',
        'ความบันเทิง',
        'สุขภาพ',
        'การลงทุน',
        'ชำระหนี้',
        'อื่นๆ',
    ],
};
