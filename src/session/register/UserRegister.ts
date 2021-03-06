import { Request, } from "express";
import { UserInfoController } from "../../controller/UserInfoController";
import { UserInfo } from "../../entity/UserInfo";
import { verification, Check } from "../utility/sms";

import { ExternalInterface, } from "../utility/ExternalInterface";
import { InjectionRouter } from "../../routes/RoutersManagement";
import { IBasicMessageCarryDataInterface, ITrouble } from "../utility/BassMessage";


interface IRegisterInfomation
{
    telephone_number: string;
    code: string;
    data: Partial<UserInfo>;
}

export class UserRegister extends ExternalInterface<IBasicMessageCarryDataInterface>
{
    private uic: UserInfoController = new UserInfoController();

    public async Verify (request: Request): Promise<void>
    {
        const body = request.body as IRegisterInfomation;
        if (body.telephone_number && body.code)
        {
            body.data.telephone_number = body.telephone_number;
            return;
        }
        return Promise.reject({ status: 0, message: "invail request body" });
    }

    public async Process (requset: Request): Promise<ITrouble<IBasicMessageCarryDataInterface>>
    {
        const reg_info = requset.body as IRegisterInfomation;

        if(!Check({ id: reg_info.telephone_number, type: "verification"}, reg_info.code))
        {
            return {status: "solve", data: {status: 0, message: "code is error"} };
        }

        try
        {
            await this.uic.Construct(reg_info.data as UserInfo);
        }
        catch(error)
        {
            if(error?.code === "ER_DUP_ENTRY")
                return {status: "solve", data: {status: 0, message: "account is already exists"} }
            return { status: "fail",  data:{ status: 0, message: "register service is not available"} };
        }
        return { status: "solve",  data:{ status: 0, message: "register success" } }
    }


    // eslint-disable-next-line @typescript-eslint/no-untyped-public-signature
    @verification()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public telephone_register (requset: Request): any
    {
        const reg_info = requset.body as IRegisterInfomation;
        if('telephone_number' in reg_info)
        {
            return {PhoneNumbers: reg_info.telephone_number };
        }
        return {status:0, message: "register fail"};
    }
}

InjectionRouter({method: "post", route: "/user_register", controller: new UserRegister});