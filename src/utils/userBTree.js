// User binary-tree
const crypto = require("crypto");
const fs = require("fs");

const encode = 'hex';
class UserBTree {
    constructor(userList, filePath) {
        try {
            fs.readFileSync(filePath);
            this._parseTreeJson(filePath);
        }catch (e){
            this.degree = 0;
            this.userList = userList;
            this.userPaths = [];

            let len = userList.length;
            let tmp = 1;
            while(tmp < len){
                this.degree ++;
                tmp *= 2;
            }
            this._genTreeJson();
            this._getUserPaths(this.tree, []);
        }
    }

    _randomize(tree){
        tree.val = crypto.randomBytes(32).toString(encode);
        if(tree.left && tree.right){
            this._randomize(tree.left);
            this._randomize(tree.right);
        }
    }

    _genTreeJson(){
        this.tree = {val: crypto.randomBytes(32).toString(encode), left: null, right: null, used: false};
        for(let i = 0; i < this.degree; i ++){
            const temp = JSON.parse(JSON.stringify(this.tree));
            this.tree.left = JSON.parse(JSON.stringify(temp));
            this.tree.right = JSON.parse(JSON.stringify(temp));
            this._randomize(this.tree.left);
            this._randomize(this.tree.right);
        }
    }

    _parseTreeJson(filePath){
        const temp = JSON.parse(fs.readFileSync(filePath));
        this.tree = temp.tree;
        this.degree = temp.degree;
        this.userList = temp.userList;
        this.userPaths = temp.userPaths;
        // console.log(this.tree);
        // console.log(this.degree);
        // console.log(this.userList);
        // console.log(this.userPaths);
    }

    _getUserPaths(node, prefix){
        prefix.push(node.val);
        let temp = [].concat(prefix);
        if(node.left){
            this._getUserPaths(node.left, [].concat(temp));
        }
        if(node.right){
            this._getUserPaths(node.right, [].concat(temp));
        }
        if(node.left === null && node.right === null){
            this.userPaths.push(temp);
        }
    }

    toJson(savePath){
        const saveStream = fs.createWriteStream(savePath);
        saveStream.write(JSON.stringify({
            tree: this.tree,
            degree: this.degree,
            userList: this.userList,
            userPaths: this.userPaths,
        }));
    }

    addUser(userAddress){
        this.userList.push(userAddress);
        if(Math.pow(2,this.degree) < this.userList.length){
            const temp = JSON.parse(JSON.stringify(this.tree));
            this.tree.val = crypto.randomBytes(32).toString('hex');
            this.tree.left = JSON.parse(JSON.stringify(temp));
            this.tree.right = JSON.parse(JSON.stringify(temp));
            this._randomize(this.tree.right);
        }
        this._getUserPaths(this.tree,[]);
    }

    getGroupKeys(userGroup){
        let keyGroup = [];
        this.current = 0;
        return new Promise(resolve => {
            this._iterateTree(this.tree, userGroup, keyGroup).then(() => {
                resolve(keyGroup);
            });
        })
    }

    async _iterateTree(node, userGroup, keyGroup) {
        if(node.left === null && node.right === null){
            this.current ++;
            return ((this.current - 1) < this.userList.length)
                && (userGroup.includes(this.userList[this.current - 1]));
        }else{
            const res1 = await this._iterateTree(node.left, userGroup, keyGroup);
            const res2 = await this._iterateTree(node.right, userGroup, keyGroup);
            if(res1 && res2){
                return true;
            }else{
                if(res1) keyGroup.push(node.left.val);
                if(res2) keyGroup.push(node.right.val);
                return false;
            }
        }
    }

    getUsedKey(userID, userGroup){
        const index = this.userList.indexOf(userID);
        const path = this.userPaths[index];
        // console.log(path);
        return this.getGroupKeys(userGroup).then(keyGroup => {
            for(let key of path){
                if(keyGroup.includes(key)){
                    return key;
                }
            }
        })
    }

    printTree(){
        async function iteratePrint(node, prefix, start, needBar) {
            if(node){
                console.log('%s%s\x1B[32m%s\x1B[0m', prefix, start, node.val);
                if(needBar){
                    prefix += '│\t';
                }else{
                    prefix += ' \t';
                }
                await iteratePrint(node.left, prefix,'├── ', true);
                await iteratePrint(node.right, prefix, '└── ', false);
            }
        }

        return iteratePrint(this.tree, '','root: ├── ', 0);
    }
}

module.exports = {
    UserBTree
}